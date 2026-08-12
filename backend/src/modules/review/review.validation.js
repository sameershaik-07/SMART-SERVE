const { z } = require("zod");

const createReviewSchema = z.object({
    bookingId: z
        .number()
        .int()
        .positive(),

    rating: z
        .number()
        .int()
        .min(1)
        .max(5),

    comment: z
        .string()
        .trim()
        .max(500)
        .optional()
});

module.exports = {
    createReviewSchema
};