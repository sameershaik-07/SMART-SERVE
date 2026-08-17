const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");

// Helper to generate access & refresh tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET || "default_jwt_secret",
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "default_jwt_secret",
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "30d" }
    );

    return { accessToken, refreshToken };
};

const registerUser = async (userData) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
        data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            phone: userData.phone,
            role: userData.role
        }
    });

    // Create role-specific profile
    if (user.role === "CUSTOMER") {
        await prisma.customer.create({
            data: { userId: user.id }
        });
    } else if (user.role === "PROVIDER") {
        // If categoryId not provided, default to first category or 1
        const categoryId = userData.categoryId || 1;
        await prisma.serviceProvider.create({
            data: {
                userId: user.id,
                categoryId: categoryId
            }
        });
    } else if (user.role === "ADMIN") {
        await prisma.admin.create({
            data: { userId: user.id }
        });
    }

    // Generate OTP for email verification (6-digit)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await prisma.emailOTP.create({
        data: {
            email: user.email,
            otp: otpCode,
            expiresAt
        }
    });

    const tokens = generateTokens(user);
    const { password, ...userWithoutPassword } = user;

    return {
        user: userWithoutPassword,
        otp: otpCode, // returned for dev testing / email helper
        ...tokens
    };
};

const loginUser = async (userData) => {
    const user = await prisma.user.findUnique({
        where: { email: userData.email }
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(userData.password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
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
        throw new Error("Invalid or expired OTP");
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
        // Return generic success to prevent email enumeration
        return { message: "If account exists, password reset instructions have been sent." };
    }

    const resetToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "default_jwt_secret",
        { expiresIn: "1h" }
    );

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
        data: {
            email,
            token: resetToken,
            expiresAt
        }
    });

    return {
        message: "Password reset token generated",
        resetToken // returned for API testing
    };
};

const resetPasswordWithToken = async (token, newPassword) => {
    const record = await prisma.passwordResetToken.findUnique({
        where: { token }
    });

    if (!record || record.expiresAt < new Date()) {
        throw new Error("Invalid or expired password reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { email: record.email },
        data: { password: hashedPassword }
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return { message: "Password reset successfully. Please log in with your new password." };
};

const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || "default_jwt_secret");
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            throw new Error("User not found");
        }

        const tokens = generateTokens(user);
        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            ...tokens
        };
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
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