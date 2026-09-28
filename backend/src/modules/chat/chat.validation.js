const { z } = require("zod");

const createConversationSchema = z.object({
    providerId: z.number().int().positive("providerId must be a positive integer"),
    bookingId: z.number().int().positive().optional()
});

const sendMessageSchema = z.object({
    message: z.string().trim().min(1, "Message cannot be empty").max(5000, "Message cannot exceed 5000 characters"),
    messageType: z.enum(["TEXT", "IMAGE", "SYSTEM"]).default("TEXT")
});

const getMessagesQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50)
});
// Allow optional skipCount to avoid an expensive COUNT() when the caller doesn't need it
// Default is false to preserve existing behavior for callers that expect counts
const getMessagesQuerySchemaWithSkip = getMessagesQuerySchema.extend({
    skipCount: z.coerce.boolean().optional().default(false)
});

module.exports = {
    createConversationSchema,
    sendMessageSchema,
    getMessagesQuerySchema,
    getMessagesQuerySchemaWithSkip
};

