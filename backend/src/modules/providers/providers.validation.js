const { z } = require("zod");

const updateProviderProfileSchema = z.object({
    bio: z.string().optional(),
    categoryId: z.number().int().positive().optional(),
    documents: z.array(z.string()).optional(),
    availability: z.boolean().optional()
});

const providerSearchQuerySchema = z.object({
    search: z.string().optional(),
    categoryId: z.string().optional(),
    minRating: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional()
});

module.exports = {
    updateProviderProfileSchema,
    providerSearchQuerySchema
};
