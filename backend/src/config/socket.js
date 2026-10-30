const { Server } = require("socket.io");
const { verifyToken } = require("./jwt");
const prisma = require("./prisma");

let io = null;

const initSocket = (httpServer) => {
    const configuredOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

    io = new Server(httpServer, {
        cors: {
            origin: configuredOrigins.length > 0 && !configuredOrigins.includes("*") ? configuredOrigins : "*",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true
        }
    });

    // Socket.io JWT Authentication Middleware
    io.use((socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
                socket.handshake.query?.token;

            if (!token) {
                return next(new Error("Authentication token required"));
            }

            const decoded = verifyToken(token);
            socket.user = {
                userId: decoded.userId,
                role: decoded.role,
                email: decoded.email
            };

            next();
        } catch (error) {
            return next(new Error("Invalid or expired authentication token"));
        }
    });

    io.on("connection", (socket) => {
        const { userId, role } = socket.user;
        socket.authorizedConversations = new Map();
        const userRoom = `user_${userId}`;
        socket.join(userRoom);

        if (role === "ADMIN") {
            socket.join("admin_monitoring");
        }

        // Join specific conversation room
        socket.on("join_conversation", async ({ conversationId }) => {
            if (!conversationId) return;

            const convId = parseInt(conversationId);
            if (isNaN(convId)) return;
            const convRoom = `conversation_${convId}`;

            // Check authorization: Admin can join any, Customer/Provider must be participant
            if (role !== "ADMIN") {
                const conversation = await prisma.conversation.findUnique({
                    where: { id: convId },
                    include: {
                        customer: true,
                        provider: true
                    }
                });

                if (!conversation) {
                    return socket.emit("error", { message: "Conversation not found" });
                }

                const isCustomer = conversation.customer?.userId === userId;
                const isProvider = conversation.provider?.userId === userId;

                if (!isCustomer && !isProvider) {
                    return socket.emit("error", { message: "Unauthorized to join this conversation" });
                }

                socket.authorizedConversations.set(convId, {
                    customerUserId: conversation.customer?.userId || null,
                    providerUserId: conversation.provider?.userId || null
                });
            } else {
                socket.authorizedConversations.set(convId, {
                    customerUserId: null,
                    providerUserId: null
                });
            }

            socket.join(convRoom);
            socket.emit("joined_conversation", { conversationId: convId });
        });

        // Leave conversation room
        socket.on("leave_conversation", ({ conversationId }) => {
            if (!conversationId) return;
            const convId = parseInt(conversationId);
            if (isNaN(convId)) return;
            const convRoom = `conversation_${convId}`;
            socket.leave(convRoom);
            if (socket.authorizedConversations) socket.authorizedConversations.delete(convId);
        });

        // Send message via WebSocket
        socket.on("send_message", async (payload, callback) => {
            try {
                const { conversationId, message, messageType = "TEXT" } = payload || {};
                if (!conversationId || !message?.trim()) {
                    if (callback) callback({ error: "conversationId and message are required" });
                    return;
                }

                const convId = parseInt(conversationId);
                if (isNaN(convId)) {
                    if (callback) callback({ error: "Invalid conversationId" });
                    return;
                }

                let conversationMeta = socket.authorizedConversations?.get(convId);

                if (!conversationMeta) {
                    const conversation = await prisma.conversation.findUnique({
                        where: { id: convId },
                        include: {
                            customer: { include: { user: true } },
                            provider: { include: { user: true } }
                        }
                    });

                    if (!conversation) {
                        if (callback) callback({ error: "Conversation not found" });
                        return;
                    }

                    if (role !== "ADMIN") {
                        const isCustomer = conversation.customer?.userId === userId;
                        const isProvider = conversation.provider?.userId === userId;
                        if (!isCustomer && !isProvider) {
                            if (callback) callback({ error: "Unauthorized to send messages in this conversation" });
                            return;
                        }
                    }

                    conversationMeta = {
                        customerUserId: conversation.customer?.userId || null,
                        providerUserId: conversation.provider?.userId || null
                    };
                }

                const chatMessage = await prisma.chatMessage.create({
                    data: {
                        conversationId: convId,
                        senderId: userId,
                        senderRole: role,
                        message: message.trim(),
                        messageType
                    },
                    include: {
                        sender: {
                            select: { id: true, name: true, email: true, role: true }
                        }
                    }
                });

                // Emit to conversation room
                io.to(`conversation_${convId}`).emit("new_message", chatMessage);

                if (callback) callback({ success: true, message: chatMessage });

                // Asynchronously update conversation lastMessage
                prisma.conversation.update({
                    where: { id: convId },
                    data: {
                        lastMessage: message.trim(),
                        lastMessageAt: new Date()
                    }
                }).catch((err) => {
                    console.error("Conversation snippet update failed:", err.message);
                });

                // Deliver push notifications to personal rooms
                try {
                    if (role === "ADMIN") {
                        if (conversationMeta.customerUserId) {
                            io.to(`user_${conversationMeta.customerUserId}`).emit("message_notification", {
                                conversationId: convId,
                                message: chatMessage
                            });
                        }
                        if (conversationMeta.providerUserId) {
                            io.to(`user_${conversationMeta.providerUserId}`).emit("message_notification", {
                                conversationId: convId,
                                message: chatMessage
                            });
                        }
                    } else {
                        const recipientUserId =
                            role === "CUSTOMER" ? conversationMeta.providerUserId : conversationMeta.customerUserId;

                        if (recipientUserId && recipientUserId !== userId) {
                            io.to(`user_${recipientUserId}`).emit("message_notification", {
                                conversationId: convId,
                                message: chatMessage
                            });
                        }
                    }

                    io.to("admin_monitoring").emit("admin_new_message", {
                        conversationId: convId,
                        message: chatMessage
                    });
                } catch (err) {
                    console.error("Socket notification emit failed:", err.message);
                }
            } catch (err) {
                console.error("Socket send_message error:", err.message);
                if (callback) callback({ error: err.message || "Failed to send message" });
            }
        });

        // Typing indicators
        socket.on("typing_start", ({ conversationId }) => {
            if (!conversationId) return;
            const convId = parseInt(conversationId);
            if (isNaN(convId)) return;
            socket.to(`conversation_${convId}`).emit("user_typing", {
                conversationId: convId,
                userId,
                role
            });
        });

        socket.on("typing_stop", ({ conversationId }) => {
            if (!conversationId) return;
            const convId = parseInt(conversationId);
            if (isNaN(convId)) return;
            socket.to(`conversation_${convId}`).emit("user_stopped_typing", {
                conversationId: convId,
                userId,
                role
            });
        });

        // Mark messages as read
        socket.on("mark_read", async ({ conversationId }) => {
            if (!conversationId) return;
            const convId = parseInt(conversationId);
            if (isNaN(convId)) return;

            await prisma.chatMessage.updateMany({
                where: {
                    conversationId: convId,
                    senderId: { not: userId },
                    isRead: false
                },
                data: {
                    isRead: true,
                    readAt: new Date()
                }
            });

            socket.to(`conversation_${convId}`).emit("messages_read", {
                conversationId: convId,
                readBy: userId
            });
        });

        socket.on("disconnect", () => {
            // Disconnect clean up
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
};

module.exports = { initSocket, getIO };
