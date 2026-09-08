const {
    createConversationSchema,
    sendMessageSchema,
    getMessagesQuerySchema
} = require("./chat.validation");
const chatService = require("./chat.service");

// POST /api/chat/conversations
const getOrCreateConversation = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const { providerId, bookingId } = createConversationSchema.parse(req.body);

        const conversation = await chatService.getOrCreateConversation(
            userId,
            role,
            providerId,
            bookingId
        );

        return res.status(200).json({
            message: "Conversation ready",
            conversation
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/chat/conversations
const getUserConversations = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        const conversations = await chatService.getUserConversations(userId, role);

        return res.status(200).json({
            count: conversations.length,
            conversations
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/chat/conversations/:id/messages
const getConversationMessages = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const conversationId = req.params.id;
        const { page, limit } = getMessagesQuerySchema.parse(req.query);

        const history = await chatService.getConversationMessages(
            conversationId,
            userId,
            role,
            page,
            limit
        );

        return res.status(200).json(history);
    } catch (error) {
        next(error);
    }
};

// POST /api/chat/conversations/:id/messages
const sendMessage = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const conversationId = req.params.id;
        const { message, messageType } = sendMessageSchema.parse(req.body);

        const chatMessage = await chatService.sendMessage(
            conversationId,
            userId,
            role,
            message,
            messageType
        );

        return res.status(201).json({
            message: "Message sent successfully",
            data: chatMessage
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/chat/conversations/:id/read
const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const conversationId = req.params.id;

        const result = await chatService.markConversationRead(conversationId, userId);

        return res.status(200).json({
            message: "Messages marked as read",
            ...result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrCreateConversation,
    getUserConversations,
    getConversationMessages,
    sendMessage,
    markAsRead
};

