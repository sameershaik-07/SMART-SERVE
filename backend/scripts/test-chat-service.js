require("dotenv").config();
const http = require("http");
const jwt = require("jsonwebtoken");
const { io: ioClient } = require("socket.io-client");
const app = require("../src/app");
const { initSocket } = require("../src/config/socket");
const prisma = require("../src/config/prisma");

const TEST_PORT = 3456;

async function runTests() {
    console.log("🚀 Starting Real-Time Messaging & Admin Audit Backend Tests...\n");

    // 1. Create HTTP server and attach Socket.io
    const server = http.createServer(app);
    initSocket(server);

    await new Promise((resolve) => server.listen(TEST_PORT, resolve));
    console.log(`✅ Test server running on port ${TEST_PORT}`);

    const baseUrl = `http://localhost:${TEST_PORT}`;

    try {
        // 2. Setup or find Customer, Provider, Admin users
        console.log("\n--> 1. Fetching or creating test users...");
        let customer = await prisma.user.findFirst({
            where: { role: "CUSTOMER" },
            include: { customer: true }
        });
        let provider = await prisma.user.findFirst({
            where: { role: "PROVIDER" },
            include: { provider: true }
        });
        let admin = await prisma.user.findFirst({
            where: { role: "ADMIN" }
        });

        if (!customer || !customer.customer) {
            console.log("Creating test customer...");
            customer = await prisma.user.create({
                data: {
                    name: "Chat Test Customer",
                    email: `customer_chat_${Date.now()}@example.com`,
                    password: "hashedPassword123!",
                    role: "CUSTOMER",
                    customer: { create: { address: "Test Address" } }
                },
                include: { customer: true }
            });
        }

        if (!provider || !provider.provider) {
            console.log("Creating test provider...");
            let cat = await prisma.serviceCategory.findFirst();
            if (!cat) {
                cat = await prisma.serviceCategory.create({
                    data: { categoryName: `TestCat_${Date.now()}` }
                });
            }
            provider = await prisma.user.create({
                data: {
                    name: "Chat Test Provider",
                    email: `provider_chat_${Date.now()}@example.com`,
                    password: "hashedPassword123!",
                    role: "PROVIDER",
                    provider: { create: { categoryId: cat.id, verified: true } }
                },
                include: { provider: true }
            });
        }

        if (!admin) {
            console.log("Creating test admin...");
            admin = await prisma.user.create({
                data: {
                    name: "Chat Test Admin",
                    email: `admin_chat_${Date.now()}@example.com`,
                    password: "hashedPassword123!",
                    role: "ADMIN",
                    admin: { create: {} }
                }
            });
        }

        // Generate JWT tokens
        const secret = process.env.JWT_SECRET || "default_jwt_secret";
        const customerToken = jwt.sign({ userId: customer.id, role: customer.role, email: customer.email }, secret);
        const providerToken = jwt.sign({ userId: provider.id, role: provider.role, email: provider.email }, secret);
        const adminToken = jwt.sign({ userId: admin.id, role: admin.role, email: admin.email }, secret);

        console.log(`✅ Tokens generated for Customer (#${customer.id}), Provider (#${provider.id}), Admin (#${admin.id})`);

        // 3. Test POST /api/chat/conversations (Customer starts conversation with Provider)
        console.log("\n--> 2. Testing Customer -> Provider Conversation initialization...");
        const initRes = await fetch(`${baseUrl}/api/chat/conversations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${customerToken}`
            },
            body: JSON.stringify({ providerId: provider.provider.id })
        });
        const initData = await initRes.json();
        if (!initRes.ok) throw new Error("Failed to init conversation: " + JSON.stringify(initData));
        const conversationId = initData.conversation.id;
        console.log(`✅ Conversation ready: ID #${conversationId}`);

        // 4. Test Customer sending message
        console.log("\n--> 3. Testing Customer sending message...");
        const sendRes1 = await fetch(`${baseUrl}/api/chat/conversations/${conversationId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${customerToken}`
            },
            body: JSON.stringify({ message: "Hello! Are you available tomorrow morning?" })
        });
        const sendData1 = await sendRes1.json();
        if (!sendRes1.ok) throw new Error("Failed to send customer message: " + JSON.stringify(sendData1));
        console.log(`✅ Customer message saved: "${sendData1.data.message}"`);

        // 5. Test Provider replying
        console.log("\n--> 4. Testing Provider replying...");
        const sendRes2 = await fetch(`${baseUrl}/api/chat/conversations/${conversationId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${providerToken}`
            },
            body: JSON.stringify({ message: "Yes! I can arrive at 10:00 AM." })
        });
        const sendData2 = await sendRes2.json();
        if (!sendRes2.ok) throw new Error("Failed to send provider reply: " + JSON.stringify(sendData2));
        console.log(`✅ Provider reply saved: "${sendData2.data.message}"`);

        // 6. Test GET /api/chat/conversations/:id/messages (History)
        console.log("\n--> 5. Fetching conversation history...");
        const historyRes = await fetch(`${baseUrl}/api/chat/conversations/${conversationId}/messages`, {
            headers: { "Authorization": `Bearer ${customerToken}` }
        });
        const historyData = await historyRes.json();
        console.log(`✅ Messages retrieved: ${historyData.totalMessages} total message(s)`);

        // 7. Test PATCH /api/chat/conversations/:id/read
        console.log("\n--> 6. Marking messages as read...");
        const readRes = await fetch(`${baseUrl}/api/chat/conversations/${conversationId}/read`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${customerToken}` }
        });
        const readData = await readRes.json();
        console.log(`✅ Mark read result: count=${readData.count}`);

        // 8. Test Admin Chat Inspection Endpoints
        console.log("\n--> 7. Testing Admin Chat Audit Capabilities...");

        // A) Admin List all platform conversations
        const adminConvsRes = await fetch(`${baseUrl}/api/admin/chat/conversations`, {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const adminConvsData = await adminConvsRes.json();
        if (!adminConvsRes.ok) throw new Error("Admin conversations failed: " + JSON.stringify(adminConvsData));
        console.log(`✅ Admin retrieved ${adminConvsData.total} platform conversation(s) across users.`);

        // B) Admin Inspect full unredacted transcript
        const adminTranscriptRes = await fetch(`${baseUrl}/api/admin/chat/conversations/${conversationId}/messages`, {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const adminTranscriptData = await adminTranscriptRes.json();
        if (!adminTranscriptRes.ok) throw new Error("Admin transcript failed: " + JSON.stringify(adminTranscriptData));
        console.log(`✅ Admin inspected full audit transcript: ${adminTranscriptData.totalMessages} message(s) found.`);

        // C) Admin Inject moderator notice
        const adminNoticeRes = await fetch(`${baseUrl}/api/admin/chat/conversations/${conversationId}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({ message: "Admin Notice: Conversation verified for safety." })
        });
        const adminNoticeData = await adminNoticeRes.json();
        console.log(`✅ Admin moderator notice posted: "${adminNoticeData.data.message}"`);

        // D) Admin Chat Stats
        const adminStatsRes = await fetch(`${baseUrl}/api/admin/chat/stats`, {
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const adminStatsData = await adminStatsRes.json();
        console.log(`✅ Admin chat stats:`, adminStatsData);

        // 9. Test Socket.io Real-Time WebSocket
        console.log("\n--> 8. Testing Socket.io WebSocket real-time delivery...");
        await new Promise((resolve, reject) => {
            const clientSocket = ioClient(baseUrl, {
                auth: { token: customerToken },
                transports: ["websocket"]
            });

            const timeout = setTimeout(() => {
                clientSocket.disconnect();
                reject(new Error("Socket test timed out after 5s"));
            }, 5000);

            clientSocket.on("connect", () => {
                console.log(`✅ Socket.io client connected with ID: ${clientSocket.id}`);
                clientSocket.emit("join_conversation", { conversationId });
            });

            clientSocket.on("joined_conversation", () => {
                console.log(`✅ Socket joined conversation room ${conversationId}`);
                clientSocket.emit("send_message", {
                    conversationId,
                    message: "Real-time WebSocket message test!"
                }, (ack) => {
                    console.log(`✅ WebSocket message acknowledged:`, ack?.success);
                });
            });

            clientSocket.on("new_message", (msg) => {
                if (msg.message === "Real-time WebSocket message test!") {
                    console.log(`✅ Received real-time broadcast: "${msg.message}"`);
                    clearTimeout(timeout);
                    clientSocket.disconnect();
                    resolve();
                }
            });

            clientSocket.on("connect_error", (err) => {
                clearTimeout(timeout);
                clientSocket.disconnect();
                reject(err);
            });
        });

        console.log("\n🎉 ALL REAL-TIME MESSAGING AND ADMIN AUDIT TESTS PASSED SUCCESSFULLY!");
    } finally {
        server.close();
        await prisma.$disconnect();
    }
}

runTests()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Test failed:", err);
        process.exit(1);
    });

