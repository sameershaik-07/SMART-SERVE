const prisma = require("../../config/prisma");
const ApiError = require("../../utils/errors");

let socketConfig;
try {
    socketConfig = require("../../config/socket");
} catch {
    socketConfig = null;
}

// 1. Get or Create a Conversation between Customer and Provider
const getOrCreateConversation = async (userId, role, targetProviderId, bookingId) => {
    let customerId;
    let providerId;

    if (role === "CUSTOMER") {
        let customer = await prisma.customer.findUnique({ where: { userId } });
        if (!customer) {
            customer = await prisma.customer.create({ data: { userId } });
        }
        customerId = customer.id;

        const pId = parseInt(targetProviderId);
        if (isNaN(pId)) {
            throw ApiError.badRequest("Invalid provider ID");
        }

        let providerExists = await prisma.serviceProvider.findUnique({
            where: { id: pId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });

        if (!providerExists) {
            providerExists = await prisma.serviceProvider.findUnique({
                where: { userId: pId },
                include: { user: { select: { id: true, name: true, email: true } } }
            });
        }

        if (!providerExists) {
            throw ApiError.notFound("Service provider not found");
        }
        providerId = providerExists.id;
    } else if (role === "PROVIDER") {
        let provider = await prisma.serviceProvider.findUnique({ where: { userId } });
        if (!provider) {
            const firstCategory = await prisma.serviceCategory.findFirst();
            provider = await prisma.serviceProvider.create({
                data: {
                    userId,
                    categoryId: firstCategory ? firstCategory.id : 1,
                    bio: "Verified Service Provider",
                    verified: true
                }
            });
        }
        providerId = provider.id;

        const cId = parseInt(targetProviderId);
        if (isNaN(cId)) {
            throw ApiError.badRequest("Invalid customer ID");
        }

        let customerExists = await prisma.customer.findUnique({
            where: { id: cId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });
        if (!customerExists) {
            customerExists = await prisma.customer.findUnique({
                where: { userId: cId },
                include: { user: { select: { id: true, name: true, email: true } } }
            });
        }
        if (!customerExists) {
            throw ApiError.notFound("Customer not found");
        }
        customerId = customerExists.id;
    } else {
        throw ApiError.forbidden("Only customers or providers can initiate conversations");
    }

    // Verify booking if provided
    let validBookingId = null;
    if (bookingId) {
        const b = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } });
        if (b) validBookingId = b.id;
    }

    // Find existing conversation
    let conversation = await prisma.conversation.findUnique({
        where: {
            customerId_providerId: { customerId, providerId }
        },
        include: {
            customer: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
            provider: {
                include: {
                    user: { select: { id: true, name: true, email: true, phone: true } },
                    category: { select: { id: true, categoryName: true } }
                }
            },
            booking: { select: { id: true, serviceDate: true, status: true } }
        }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                customerId,
                providerId,
                bookingId: validBookingId
            },
            include: {
                customer: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
                provider: {
                    include: {
                        user: { select: { id: true, name: true, email: true, phone: true } },
                        category: { select: { id: true, categoryName: true } }
                    }
                },
                booking: { select: { id: true, serviceDate: true, status: true } }
            }
        });
    }

    return conversation;
};

// 2. Fetch all conversations for the authenticated user
const getUserConversations = async (userId, role) => {
    let whereClause = {};

    if (role === "CUSTOMER") {
        let customer = await prisma.customer.findUnique({ where: { userId } });
        if (!customer) {
            customer = await prisma.customer.create({ data: { userId } });
        }
        whereClause = { customerId: customer.id };
    } else if (role === "PROVIDER") {
        const provider = await prisma.serviceProvider.findUnique({ where: { userId } });
        if (!provider) return [];
        whereClause = { providerId: provider.id };
    } else if (role === "ADMIN") {
        whereClause = {};
    } else {
        return [];
    }

    const conversations = await prisma.conversation.findMany({
        where: whereClause,
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
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1
            }
        },
        orderBy: { updatedAt: "desc" }
    });

    const convIds = conversations.map((c) => c.id);

    let unreadGroups = [];
    if (convIds.length > 0) {
        unreadGroups = await prisma.chatMessage.groupBy({
            by: ["conversationId"],
            where: {
                conversationId: { in: convIds },
                senderId: { not: userId },
                isRead: false
            },
            _count: { _all: true }
        });
    }

    const unreadMap = unreadGroups.reduce((acc, g) => {
        acc[g.conversationId] = g._count._all || 0;
        return acc;
    }, {});

    const conversationsWithUnread = conversations.map((conv) => ({
        ...conv,
        unreadCount: unreadMap[conv.id] || 0,
        lastMessageSnippet: conv.messages[0] || null
    }));

    return conversationsWithUnread;
};

// 3. Fetch paginated messages for a conversation
const getConversationMessages = async (conversationId, userId, role, page = 1, limit = 50, skipCount = false) => {
    const convId = parseInt(conversationId);
    if (isNaN(convId)) {
        throw ApiError.badRequest("Invalid conversation ID");
    }

    const conversation = await prisma.conversation.findUnique({
        where: { id: convId },
        include: {
            customer: true,
            provider: true
        }
    });

    if (!conversation) {
        throw ApiError.notFound("Conversation not found");
    }

    if (role !== "ADMIN") {
        const userIdInt = parseInt(userId);
        const isCustomer = conversation.customer?.userId === userIdInt;
        const isProvider = conversation.provider?.userId === userIdInt;

        if (!isCustomer && !isProvider) {
            throw ApiError.forbidden("Access denied: You are not a participant in this conversation");
        }
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 50);
    const skip = (pageNum - 1) * limitNum;

    if (skipCount) {
        const messages = await prisma.chatMessage.findMany({
            where: { conversationId: convId },
            skip,
            take: limitNum,
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });

        return {
            conversationId: convId,
            page: pageNum,
            limit: limitNum,
            messages
        };
    }

    const [total, msgs] = await Promise.all([
        prisma.chatMessage.count({ where: { conversationId: convId } }),
        prisma.chatMessage.findMany({
            where: { conversationId: convId },
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

    return {
        conversationId: convId,
        totalMessages: total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        messages: msgs
    };
};

// 4. Send a new message
const sendMessage = async (conversationId, senderId, senderRole, messageText, messageType = "TEXT") => {
    const convId = parseInt(conversationId);
    if (isNaN(convId)) {
        throw ApiError.badRequest("Invalid conversation ID");
    }

    const conversation = await prisma.conversation.findUnique({
        where: { id: convId },
        include: {
            customer: { include: { user: true } },
            provider: { include: { user: true } }
        }
    });

    if (!conversation) {
        throw ApiError.notFound("Conversation not found");
    }

    if (senderRole !== "ADMIN") {
        const senderIdInt = parseInt(senderId);
        const isCustomer = conversation.customer?.userId === senderIdInt;
        const isProvider = conversation.provider?.userId === senderIdInt;

        if (!isCustomer && !isProvider) {
            throw ApiError.forbidden("Access denied: You cannot message in this conversation");
        }
    }

    const chatMessage = await prisma.chatMessage.create({
        data: {
            conversationId: convId,
            senderId,
            senderRole,
            message: messageText.trim(),
            messageType
        },
        include: {
            sender: {
                select: { id: true, name: true, email: true, role: true }
            }
        }
    });

    // Update conversation snippet
    await prisma.conversation.update({
        where: { id: convId },
        data: {
            lastMessage: messageText.trim(),
            lastMessageAt: new Date()
        }
    });

    // Broadcast through socket if active
    try {
        if (socketConfig && socketConfig.getIO) {
            const io = socketConfig.getIO();
            io.to(`conversation_${convId}`).emit("new_message", chatMessage);

            const customerUserId = conversation.customer?.userId;
            const providerUserId = conversation.provider?.userId;

            if (senderRole === "ADMIN") {
                if (customerUserId) io.to(`user_${customerUserId}`).emit("message_notification", { conversationId: convId, message: chatMessage });
                if (providerUserId) io.to(`user_${providerUserId}`).emit("message_notification", { conversationId: convId, message: chatMessage });
            } else if (senderRole === "CUSTOMER" && providerUserId) {
                io.to(`user_${providerUserId}`).emit("message_notification", { conversationId: convId, message: chatMessage });
            } else if (senderRole === "PROVIDER" && customerUserId) {
                io.to(`user_${customerUserId}`).emit("message_notification", { conversationId: convId, message: chatMessage });
            }

            io.to("admin_monitoring").emit("admin_new_message", {
                conversationId: convId,
                message: chatMessage
            });
        }
    } catch (socketErr) {
        // Socket emission non-blocking
    }

    return chatMessage;
};

// 5. Mark messages as read
const markConversationRead = async (conversationId, userId) => {
    const convId = parseInt(conversationId);
    const userIdInt = parseInt(userId);

    const updated = await prisma.chatMessage.updateMany({
        where: {
            conversationId: convId,
            senderId: { not: userIdInt },
            isRead: false
        },
        data: {
            isRead: true,
            readAt: new Date()
        }
    });

    try {
        if (socketConfig && socketConfig.getIO) {
            const io = socketConfig.getIO();
            io.to(`conversation_${convId}`).emit("messages_read", {
                conversationId: convId,
                readBy: userIdInt
            });
        }
    } catch (e) {
        // ignore
    }

    return { success: true, count: updated.count };
};

module.exports = {
    getOrCreateConversation,
    getUserConversations,
    getConversationMessages,
    sendMessage,
    markConversationRead
};
