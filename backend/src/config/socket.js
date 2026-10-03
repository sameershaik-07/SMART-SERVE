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
        // Track conversations this socket is authorized for to avoid repeated DB checks
        socket.authorizedConversations = new Map(); // convId -> { customerUserId, providerUserId }
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

                // Store minimal conversation metadata on the socket for fast authorization checks
                socket.authorizedConversations.set(convId, {
                    customerUserId: conversation.customer?.userId || null,
                    providerUserId: conversation.provider?.userId || null
                });
            } else {
                // Admins are allowed — store an empty metadata entry for consistency
                socket.authorizedConversations.set(convId, {
                    customerUserId: null,
                    providerUserId: null
                });
            }

            socket.join(convRoom);
            console.log(`User ${userId} joined room ${convRoom}`);
            socket.emit("joined_conversation", { conversationId: convId });
        });

        // Leave conversation room
        socket.on("leave_conversation", ({ conversationId }) => {
            if (!conversationId) return;
            const convId = parseInt(conversationId);
            const convRoom = `conversation_${convId}`;
            socket.leave(convRoom);
            // Remove in-memory authorization state for this socket
            if (socket.authorizedConversations) socket.authorizedConversations.delete(convId);
            console.log(`User ${userId} left room ${convRoom}`);
        });

        // Send message via WebSocket
        socket.on("send_message", async (payload, callback) => {
            const perfStart = Date.now();
            try {
                const { conversationId, message, messageType = "TEXT" } = payload;
                if (!conversationId || !message?.trim()) {
                    if (callback) callback({ error: "conversationId and message are required" });
                    return;
                }

                const convId = parseInt(conversationId);

                // Fast authorization: check in-memory socket state first
                const tAuthStart = Date.now();
                let conversationMeta = socket.authorizedConversations?.get(convId);
                const tAuthEnd = Date.now();

                // If not present in-memory, fall back to DB check (preserves current behavior)
                if (!conversationMeta) {
                    const tDbAuthStart = Date.now();
                    const conversation = await prisma.conversation.findUnique({
                        where: { id: convId },
                        include: {
                            customer: { include: { user: true } },
                            provider: { include: { user: true } }
                        }
                    });

                    const tDbAuthEnd = Date.now();

                    if (!conversation) {
                        console.log("[CHAT PERF] conversation query:", tDbAuthEnd - tDbAuthStart, "ms");
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

                    // Build conversationMeta from DB result (do not auto-add to in-memory to avoid trusting client)
                    conversationMeta = {
                        customerUserId: conversation.customer?.userId || null,
                        providerUserId: conversation.provider?.userId || null
                    };
                    console.log("[CHAT PERF] DB auth duration:", tDbAuthEnd - tDbAuthStart, "ms");
                } else {
                    console.log("[CHAT PERF] in-memory auth check:", tAuthEnd - tAuthStart, "ms");
                }

                // Persist message in PostgreSQL (critical for durability)
                const tInsertStart = Date.now();
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
                const tInsertEnd = Date.now();
                console.log("[CHAT PERF] message insert:", tInsertEnd - tInsertStart, "ms");

                // Emit canonical message immediately to the conversation room (short critical path)
                const tEmitStart = Date.now();
                io.to(`conversation_${convId}`).emit("new_message", chatMessage);
                const tEmitEnd = Date.now();
                console.log("[CHAT PERF] socket emit:", tEmitEnd - tEmitStart, "ms");

                // Respond to sender via callback immediately
                if (callback) callback({ success: true, message: chatMessage });

                // Non-critical: update conversation snippet asynchronously
                (async () => {
                    try {
                        const tConvUpdateStart = Date.now();
                        await prisma.conversation.update({
                            where: { id: convId },
                            data: {
                                lastMessage: message.trim(),
                                lastMessageAt: new Date()
                            }
                        });
                        const tConvUpdateEnd = Date.now();
                        console.log("[CHAT PERF] conversation update:", tConvUpdateEnd - tConvUpdateStart, "ms");
                    } catch (err) {
                        console.error("Conversation update failed:", err);
                    }
                })();

                // Notify recipient's personal room (if known)
                try {
                    const recipientUserId =
                        role === "CUSTOMER" ? conversationMeta.providerUserId : conversationMeta.customerUserId;

                    if (recipientUserId && recipientUserId !== userId) {
                        io.to(`user_${recipientUserId}`).emit("message_notification", {
                            conversationId: convId,
                            message: chatMessage
                        });
                    }

                    // Admin monitoring
                    io.to("admin_monitoring").emit("admin_new_message", {
                        conversationId: convId,
                        message: chatMessage
                    });
                } catch (err) {
                    console.error("Socket notification emit failed:", err);
                }

                const perfEnd = Date.now();
                console.log("[CHAT PERF] total handler duration:", perfEnd - perfStart, "ms");
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

