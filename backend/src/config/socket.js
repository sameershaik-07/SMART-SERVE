const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const prisma = require("./prisma");

let io = null;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
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

            const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");
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
        const userRoom = `user_${userId}`;
        socket.join(userRoom);

        // If admin, join the admin monitoring room
        if (role === "ADMIN") {
            socket.join("admin_monitoring");
        }

        console.log(`⚡ Socket connected: User ${userId} (${role}) on socket ${socket.id}`);

        // Join specific conversation room
        socket.on("join_conversation", async ({ conversationId }) => {
            if (!conversationId) return;

            const convId = parseInt(conversationId);
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
            }

            socket.join(convRoom);
            console.log(`User ${userId} joined room ${convRoom}`);
            socket.emit("joined_conversation", { conversationId: convId });
        });

        // Leave conversation room
        socket.on("leave_conversation", ({ conversationId }) => {
            if (!conversationId) return;
            const convRoom = `conversation_${parseInt(conversationId)}`;
            socket.leave(convRoom);
            console.log(`User ${userId} left room ${convRoom}`);
        });

        // Send message via WebSocket
        socket.on("send_message", async (payload, callback) => {
            try {
                const { conversationId, message, messageType = "TEXT" } = payload;
                if (!conversationId || !message?.trim()) {
                    if (callback) callback({ error: "conversationId and message are required" });
                    return;
                }

                const convId = parseInt(conversationId);

                // Verify participant or admin
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

                // Persist message in PostgreSQL
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

                // Update conversation snippet
                await prisma.conversation.update({
                    where: { id: convId },
                    data: {
                        lastMessage: message.trim(),
                        lastMessageAt: new Date()
                    }
                });

                // Broadcast to conversation room
                io.to(`conversation_${convId}`).emit("new_message", chatMessage);

                // Also notify recipient's personal user room if they are outside the chat view
                const recipientUserId =
                    role === "CUSTOMER"
                        ? conversation.provider?.userId
                        : conversation.customer?.userId;

                if (recipientUserId && recipientUserId !== userId) {
                    io.to(`user_${recipientUserId}`).emit("message_notification", {
                        conversationId: convId,
                        message: chatMessage
                    });
                }

                // Broadcast to admin monitoring room for real-time compliance oversight
                io.to("admin_monitoring").emit("admin_new_message", {
                    conversationId: convId,
                    message: chatMessage
                });

                if (callback) callback({ success: true, message: chatMessage });
            } catch (err) {
                console.error("Socket send_message error:", err);
                if (callback) callback({ error: err.message || "Failed to send message" });
            }
        });

        // Typing indicators
        socket.on("typing_start", ({ conversationId }) => {
            if (!conversationId) return;
            socket.to(`conversation_${parseInt(conversationId)}`).emit("user_typing", {
                conversationId: parseInt(conversationId),
                userId,
                role
            });
        });

        socket.on("typing_stop", ({ conversationId }) => {
            if (!conversationId) return;
            socket.to(`conversation_${parseInt(conversationId)}`).emit("user_stopped_typing", {
                conversationId: parseInt(conversationId),
                userId,
                role
            });
        });

        // Mark messages as read
        socket.on("mark_read", async ({ conversationId }) => {
            if (!conversationId) return;
            const convId = parseInt(conversationId);

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
            console.log(`Socket disconnected: User ${userId} (${socket.id})`);
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

