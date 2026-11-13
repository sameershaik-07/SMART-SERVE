const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const { signAccessToken, signRefreshToken, verifyToken } = require("../../config/jwt");
const ApiError = require("../../utils/errors");
const { sendOTPEmail, sendPasswordResetEmail } = require("../../utils/email");
const { sendPasswordResetViaCognito, isCognitoConfigured } = require("../../utils/cognito");

const FORGOT_PASSWORD_MESSAGE =
    "If an account with this email exists, password reset instructions have been sent.";

// Helper to generate access & refresh tokens
const generateTokens = (user) => {
    const accessToken = signAccessToken({ userId: user.id, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    return { token: accessToken, accessToken, refreshToken };
};

const registerUser = async (userData) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
    });

    if (existingUser) {
        throw ApiError.conflict("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Resolve categoryId safely if registering as PROVIDER
    let resolvedCategoryId = null;
    if (userData.role === "PROVIDER") {
        if (userData.categoryId) {
            const cat = await prisma.serviceCategory.findUnique({
                where: { id: parseInt(userData.categoryId) }
            });
            if (cat) resolvedCategoryId = cat.id;
        }
        if (!resolvedCategoryId) {
            const firstCat = await prisma.serviceCategory.findFirst({
                orderBy: { id: "asc" }
            });
            resolvedCategoryId = firstCat ? firstCat.id : 1;
        }
    }

    // Atomic transaction for user creation and role-specific profile
    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                phone: userData.phone || null,
                role: userData.role
            }
        });

        if (user.role === "CUSTOMER") {
            await tx.customer.create({
                data: { userId: user.id, walletBalance: 0 }
            });
        } else if (user.role === "PROVIDER") {
            await tx.serviceProvider.create({
                data: {
                    userId: user.id,
                    categoryId: resolvedCategoryId,
                    verified: false,
                    availability: true
                }
            });
        } else if (user.role === "ADMIN") {
            await tx.admin.create({
                data: { userId: user.id }
            });
        }

        // Generate OTP for email verification (6-digit)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await tx.emailOTP.create({
            data: {
                email: user.email,
                otp: otpCode,
                expiresAt
            }
        });

        return { user, otpCode };
    });

    // Send email asynchronously without blocking registration
    sendOTPEmail(result.user.email, result.otpCode).catch((err) => {
        console.warn("Failed to dispatch OTP email:", err.message);
    });

    const tokens = generateTokens(result.user);
    const { password, ...userWithoutPassword } = result.user;

    return {
        user: userWithoutPassword,
        otp: result.otpCode,
        ...tokens
    };
};

const loginUser = async (userData) => {
    const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: {
            customer: true,
            provider: {
                include: { category: true }
            },
            admin: true
        }
    });

    if (!user) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(userData.password, user.password);

    if (!isPasswordValid) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    const tokens = generateTokens(user);
    const { password, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        ...tokens
    };
};

const verifyEmailOTP = async (email, otp) => {
    const otpRecord = await prisma.emailOTP.findFirst({
        where: { email, otp },
        orderBy: { createdAt: "desc" }
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
        throw ApiError.badRequest("Invalid or expired OTP");
    }

    await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true }
    });

    await prisma.emailOTP.deleteMany({
        where: { email }
    });

    return { message: "Email verified successfully" };
};

const requestForgotPassword = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Return generic success to prevent email enumeration.
        return { message: FORGOT_PASSWORD_MESSAGE };
    }

    // Opaque, single-use token. This is deliberately not a JWT: a JWT reset
    // token could also be accepted as an access token by the auth middleware.
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { email } }),
        prisma.passwordResetToken.create({
            data: {
                email,
                token: resetToken,
                expiresAt
            }
        })
    ]);

    let sent = false;

    if (isCognitoConfigured) {
        try {
            await sendPasswordResetViaCognito(email, resetToken);
            sent = true;
        } catch (error) {
            console.error(
                "[auth] Cognito password reset email failed:",
                error.name || "Error",
                error.message
            );
        }
    }

    // Resend remains a fallback only; Cognito is the primary delivery path.
    // This also keeps local development working when Cognito is not configured.
    if (!sent && process.env.RESEND_API_KEY) {
        try {
            sent = await sendPasswordResetEmail(email, resetToken);
        } catch (error) {
            console.error("[auth] Resend password reset email failed:", error.message);
        }
    }

    if (!sent) {
        console.warn(`[auth] Password reset email was not sent for ${email}`);
        if (!process.env.RESEND_API_KEY && !isCognitoConfigured) {
            console.log(`[DEV MODE] Password Reset Token for ${email}: ${resetToken}`);
        }
    }

    return { message: FORGOT_PASSWORD_MESSAGE };
};

const resetPasswordWithToken = async (token, newPassword) => {
    const record = await prisma.passwordResetToken.findUnique({
        where: { token }
    });

    if (!record || record.expiresAt < new Date()) {
        throw ApiError.badRequest("Invalid or expired password reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
        prisma.user.update({
            where: { email: record.email },
            data: { password: hashedPassword }
        }),
        prisma.passwordResetToken.delete({ where: { token } })
    ]);

    return { message: "Password reset successfully. Please log in with your new password." };
};

const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = verifyToken(refreshToken);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                customer: true,
                provider: { include: { category: true } },
                admin: true
            }
        });

        if (!user) {
            throw ApiError.notFound("User not found");
        }

        const tokens = generateTokens(user);
        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            ...tokens
        };
    } catch (error) {
        throw ApiError.unauthorized("Invalid or expired refresh token");
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmailOTP,
    requestForgotPassword,
    resetPasswordWithToken,
    refreshAccessToken
};
