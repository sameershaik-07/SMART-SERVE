const prisma = require("../../config/prisma");
const chatService = require("../chat/chat.service");

// GET /api/admin/chat/conversations
// Admin can search and inspect all conversations across any customer or provider
const getAllConversations = async (req, res, next) => {
    try {
        const { search, customerId, providerId, page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        let whereClause = {};

        if (customerId) {
            whereClause.customerId = parseInt(customerId);
        }

        if (providerId) {
            whereClause.providerId = parseInt(providerId);
        }

        if (search) {
            whereClause.OR = [
                {
                    customer: {
                        user: {
                            OR: [
                                { name: { contains: search, mode: "insensitive" } },
                                { email: { contains: search, mode: "insensitive" } }
                            ]
                        }
                    }
                },
                {
                    provider: {
                        user: {
                            OR: [
                                { name: { contains: search, mode: "insensitive" } },
                                { email: { contains: search, mode: "insensitive" } }
                            ]
                        }
                    }
                },
                {
                    lastMessage: { contains: search, mode: "insensitive" }
                }
            ];
        }

        const [total, conversations] = await Promise.all([
            prisma.conversation.count({ where: whereClause }),
            prisma.conversation.findMany({
                where: whereClause,
                skip,
                take: limitNum,
                include: {
                    customer: {
                        include: {
                            user: { select: { id: true, name: true, email: true, phone: true } }
                        }
                    },
                    provider: {
                        include: {
                            user: { select: { id: true, name: true, email: true, phone: true } },
                            category: { select: { id: true, categoryName: true } }
                        }
                    },
                    _count: {
                        select: { messages: true }
                    }
                },
                orderBy: { updatedAt: "desc" }
            })
        ]);

        return res.status(200).json({
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            conversations: conversations.map((conv) => ({
                id: conv.id,
                customerId: conv.customerId,
                customer: conv.customer?.user,
                providerId: conv.providerId,
                provider: {
                    ...conv.provider?.user,
                    category: conv.provider?.category?.categoryName
                },
                totalMessages: conv._count.messages,
                lastMessage: conv.lastMessage,
                lastMessageAt: conv.lastMessageAt,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/chat/conversations/:id/messages
// Admin inspects full conversation history of ANY user or provider
const getConversationMessagesForAdmin = async (req, res, next) => {
    try {
        const conversationId = parseInt(req.params.id);
        const { page = 1, limit = 100 } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 100;
        const skip = (pageNum - 1) * limitNum;

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                customer: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true, role: true } }
                    }
                },
                provider: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
                        category: { select: { id: true, categoryName: true } }
                    }
                },
                booking: true
            }
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const [totalMessages, messages] = await Promise.all([
            prisma.chatMessage.count({ where: { conversationId } }),
            prisma.chatMessage.findMany({
                where: { conversationId },
                skip,
                take: limitNum,
                orderBy: { createdAt: "asc" },
                include: {
                    sender: {
                        select: { id: true, name: true, email: true, role: true }
                    }
                }
            })
        ]);

        return res.status(200).json({
            conversation: {
                id: conversation.id,
                customer: conversation.customer?.user,
                provider: {
                    ...conversation.provider?.user,
                    category: conversation.provider?.category?.categoryName
                },
                booking: conversation.booking,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt
            },
            totalMessages,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalMessages / limitNum),
            messages
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/chat/conversations/:id/messages
// Admin sends an official moderator message into the conversation
const sendAdminMessage = async (req, res, next) => {
    try {
        const conversationId = parseInt(req.params.id);
        const adminUserId = req.user.userId;
        const { message, messageType = "SYSTEM" } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Message content is required" });
        }

        const chatMessage = await chatService.sendMessage(
            conversationId,
            adminUserId,
            "ADMIN",
            message.trim(),
            messageType
        );

        return res.status(201).json({
            message: "Admin message posted successfully",
            data: chatMessage
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/chat/stats
// Platform-wide messaging analytics
const getChatStats = async (req, res, next) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const [
            totalConversations,
            totalMessages,
            messagesToday,
            unreadMessages
        ] = await Promise.all([
            prisma.conversation.count(),
            prisma.chatMessage.count(),
            prisma.chatMessage.count({
                where: { createdAt: { gte: startOfToday } }
            }),
            prisma.chatMessage.count({
                where: { isRead: false }
            })
        ]);

        return res.status(200).json({
            totalConversations,
            totalMessages,
            messagesToday,
            unreadMessages,
            readRatePercent: totalMessages > 0
                ? Math.round(((totalMessages - unreadMessages) / totalMessages) * 100)
                : 100
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllConversations,
    getConversationMessagesForAdmin,
    sendAdminMessage,
    getChatStats
};

