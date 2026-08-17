const { z } = require("zod");

const createServiceSchema = z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    price: z.number().positive("Price must be greater than 0"),
    durationMinutes: z.number().int().positive().optional().default(60),
    images: z.array(z.string()).optional().default([])
});

const updateServiceSchema = createServiceSchema.partial().extend({
    isActive: z.boolean().optional()
});

module.exports = {
    createServiceSchema,
    updateServiceSchema
};
