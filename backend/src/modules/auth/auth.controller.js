const {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    refreshTokenSchema
} = require("./auth.validation");
const authService = require("./auth.service");

const register = async (req, res, next) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const result = await authService.registerUser(validatedData);

        return res.status(201).json({
            message: "User registered successfully",
            ...result
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const result = await authService.loginUser(validatedData);

        return res.status(200).json({
            message: "Login successful",
            ...result
        });
    } catch (error) {
        next(error);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = verifyEmailSchema.parse(req.body);
        const result = await authService.verifyEmailOTP(email, otp);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);
        const result = await authService.requestForgotPassword(email);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = resetPasswordSchema.parse(req.body);
        const result = await authService.resetPasswordWithToken(token, newPassword);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = refreshTokenSchema.parse(req.body);
        const result = await authService.refreshAccessToken(refreshToken);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    refreshToken
};