const { z } = require("zod");

const parseBooleanFlag = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes", "y"].includes(normalized)) return true;
        if (["false", "0", "no", "n"].includes(normalized)) return false;
    }
    return value;
};

const createConversationSchema = z.object({
    providerId: z.coerce.number().int().positive("providerId must be a positive integer"),
    bookingId: z.coerce.number().int().positive().optional().nullable()
});

const sendMessageSchema = z.object({
    message: z.string().trim().min(1, "Message cannot be empty").max(5000, "Message cannot exceed 5000 characters"),
    messageType: z.enum(["TEXT", "IMAGE", "SYSTEM"]).default("TEXT")
});

const getMessagesQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50)
});

const getMessagesQuerySchemaWithSkip = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
    skipCount: z.preprocess(parseBooleanFlag, z.boolean().optional().default(false))
});

module.exports = {
    createConversationSchema,
    sendMessageSchema,
    getMessagesQuerySchema,
    getMessagesQuerySchemaWithSkip
};
