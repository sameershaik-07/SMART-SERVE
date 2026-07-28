const { z } = require("zod");

const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(20, "Name cannot exceed 20 characters"),

    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),

    phone: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Invalid phone number")
        .optional(),

    role: z.enum(["CUSTOMER", "PROVIDER", "ADMIN"]),

    categoryId: z.number().int().positive().optional(),
});

const registerValidation = registerSchema.superRefine((data, ctx) => {

    if (data.role === "PROVIDER" && !data.categoryId) {

        ctx.addIssue({
            code: "custom",
            path: ["categoryId"],
            message: "Category is required for providers"
        });

    }

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

module.exports = {
    registerSchema: registerValidation,
    loginSchema
};