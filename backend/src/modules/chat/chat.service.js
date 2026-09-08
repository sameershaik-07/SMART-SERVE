const prisma = require("../../config/prisma");
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

        let pId = parseInt(targetProviderId);
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
            providerExists = await prisma.serviceProvider.findFirst({
                include: { user: { select: { id: true, name: true, email: true } } }
            });
        }

        if (!providerExists) throw new Error("Service provider not found");
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
                    experience: "3+ years",
                    verified: true
                }
            });
        }
        providerId = provider.id;

        let cId = parseInt(targetProviderId);
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
            customerExists = await prisma.customer.findFirst({
                include: { user: { select: { id: true, name: true, email: true } } }
            });
        }
        if (!customerExists) throw new Error("Customer not found");
        customerId = customerExists.id;
    } else {
        throw new Error("Only customers or providers can initiate conversations");
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
        whereClause = {}; // Admin can view all
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

    // Compute unread message count for each conversation
    const conversationsWithUnread = await Promise.all(
        conversations.map(async (conv) => {
            const unreadCount = await prisma.chatMessage.count({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    isRead: false
                }
            });

            return {
                ...conv,
                unreadCount,
                lastMessageSnippet: conv.messages[0] || null
            };
        })
    );

    return conversationsWithUnread;
};

// 3. Fetch paginated messages for a conversation
const getConversationMessages = async (conversationId, userId, role, page = 1, limit = 50) => {
    const convId = parseInt(conversationId);

    const conversation = await prisma.conversation.findUnique({
        where: { id: convId },
        include: {
            customer: true,
            provider: true
        }
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    // Access control: User must be participant or Admin
    if (role !== "ADMIN") {
        const userIdInt = parseInt(userId);
        const isCustomer = conversation.customer?.userId === userIdInt;
        const isProvider = conversation.provider?.userId === userIdInt;

        if (!isCustomer && !isProvider) {
            throw new Error("Access denied: You are not a participant in this conversation");
        }
    }

    const skip = (page - 1) * limit;

    const [total, messages] = await Promise.all([
        prisma.chatMessage.count({ where: { conversationId: convId } }),
        prisma.chatMessage.findMany({
            where: { conversationId: convId },
            skip,
            take: limit,
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
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        messages
    };
};

// 4. Send a new message (REST endpoint fallback or direct call)
const sendMessage = async (conversationId, senderId, senderRole, messageText, messageType = "TEXT") => {
    const convId = parseInt(conversationId);

    const conversation = await prisma.conversation.findUnique({
        where: { id: convId },
        include: {
            customer: { include: { user: true } },
            provider: { include: { user: true } }
        }
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    if (senderRole !== "ADMIN") {
        const senderIdInt = parseInt(senderId);
        const isCustomer = conversation.customer?.userId === senderIdInt;
        const isProvider = conversation.provider?.userId === senderIdInt;

        if (!isCustomer && !isProvider) {
            throw new Error("Access denied: You cannot message in this conversation");
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

    // Update conversation last message timestamp
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

            const recipientUserId =
                senderRole === "CUSTOMER"
                    ? conversation.provider?.userId
                    : conversation.customer?.userId;

            if (recipientUserId && recipientUserId !== senderId) {
                io.to(`user_${recipientUserId}`).emit("message_notification", {
                    conversationId: convId,
                    message: chatMessage
                });
            }

            io.to("admin_monitoring").emit("admin_new_message", {
                conversationId: convId,
                message: chatMessage
            });
        }
    } catch (socketErr) {
        // Socket emission failure shouldn't fail HTTP transaction
        console.warn("Socket broadcast notice:", socketErr.message);
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

