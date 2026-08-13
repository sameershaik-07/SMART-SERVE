const { z } = require("zod");

const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),

    phone: z
        .string()
        .optional(),

    role: z.enum(["CUSTOMER", "PROVIDER", "ADMIN"]),

    categoryId: z.number().int().positive().optional(),
});

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
});

const verifyEmailSchema = z.object({
    email: z.string().trim().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits")
});

const forgotPasswordSchema = z.object({
    email: z.string().trim().email("Invalid email address")
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters")
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required")
});

module.exports = {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    refreshTokenSchema
};