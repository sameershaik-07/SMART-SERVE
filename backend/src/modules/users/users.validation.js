const { z } = require("zod");

const updateProfileSchema = z.object({
    name: z.string().trim().min(3).max(50).optional(),
    phone: z.string().optional(),
    address: z.string().optional()
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
    newPassword: z.string().min(8, "New password must be at least 8 characters")
});

module.exports = {
    updateProfileSchema,
    changePasswordSchema
};
