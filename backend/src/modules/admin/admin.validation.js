const { z } = require("zod");

const categorySchema = z.object({
    categoryName: z.string().trim().min(3, "Category name must be at least 3 characters"),
    description: z.string().optional()
});

const rejectProviderSchema = z.object({
    reason: z.string().optional()
});

module.exports = {
    categorySchema,
    rejectProviderSchema
};
