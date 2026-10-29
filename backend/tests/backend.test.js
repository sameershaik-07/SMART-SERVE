const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("http");
const { io: ioClient } = require("socket.io-client");
const app = require("../src/app");
const { initSocket } = require("../src/config/socket");
const prisma = require("../src/config/prisma");

const TEST_PORT = 3105;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let server;
let adminToken = "";
let providerToken = "";
let customerToken = "";
let customerId = null;
let providerId = null;
let providerUserId = null;
let createdServiceId = null;
let createdSlotId = null;
let createdBookingId = null;
let testConversationId = null;

const apiRequest = async (path, options = {}) => {
    const headers = {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
};

describe("SMART-SERVE Comprehensive Backend Test Suite", () => {
    before(async () => {
        server = http.createServer(app);
        initSocket(server);

        await new Promise((resolve) => server.listen(TEST_PORT, resolve));
        console.log(`[TEST RUNNER] Server listening on port ${TEST_PORT}`);
    });

    after(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
        await prisma.$disconnect();
    });

    // 1. Health & Server Check
    test("GET / and GET /health return 200 OK and database connected", async () => {
        const rootRes = await apiRequest("/");
        assert.strictEqual(rootRes.status, 200);
        assert.strictEqual(rootRes.data.status, "online");

        const healthRes = await apiRequest("/health");
        assert.strictEqual(healthRes.status, 200);
        assert.strictEqual(healthRes.data.database, "connected");
        assert.strictEqual(healthRes.data.status, "healthy");
    });

    // 2. Auth: Login Seeded Users
    test("POST /api/auth/login authenticates seeded Admin, Provider, and Customer", async () => {
        const adminRes = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: "admin@smartserve.com", password: "Password123!" })
        });
        assert.strictEqual(adminRes.status, 200);
        assert.ok(adminRes.data.token || adminRes.data.accessToken);
        adminToken = adminRes.data.token || adminRes.data.accessToken;

        const providerRes = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: "provider@smartserve.com", password: "Password123!" })
        });
        assert.strictEqual(providerRes.status, 200);
        providerToken = providerRes.data.token || providerRes.data.accessToken;
        providerUserId = providerRes.data.user.id;
        providerId = providerRes.data.user.provider?.id;

        const customerRes = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: "customer@smartserve.com", password: "Password123!" })
        });
        assert.strictEqual(customerRes.status, 200);
        customerToken = customerRes.data.token || customerRes.data.accessToken;
        customerId = customerRes.data.user.customer?.id;
    });

    // 3. Auth: Bad Login Returns 401 (Not 500)
    test("POST /api/auth/login with wrong password returns 401 Unauthorized", async () => {
        const badRes = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: "customer@smartserve.com", password: "WrongPassword999!" })
        });
        assert.strictEqual(badRes.status, 401);
        assert.match(badRes.data.message, /Invalid email or password/i);
    });

    // 4. Auth: Duplicate Registration Returns 409 (Not 500)
    test("POST /api/auth/register with duplicate email returns 409 Conflict", async () => {
        const dupRes = await apiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                name: "Duplicate User",
                email: "customer@smartserve.com",
                password: "Password123!",
                role: "CUSTOMER"
            })
        });
        assert.strictEqual(dupRes.status, 409);
        assert.match(dupRes.data.message, /already exists/i);
    });

    // 5. Auth: User Profile
    test("GET /api/users/profile returns authenticated user data", async () => {
        const profileRes = await apiRequest("/api/users/profile", {
            token: customerToken
        });
        assert.strictEqual(profileRes.status, 200);
        assert.strictEqual(profileRes.data.email, "customer@smartserve.com");
        assert.strictEqual(profileRes.data.role, "CUSTOMER");
    });

    // 6. Categories (Public)
    test("GET /api/admin/categories returns the 8 marketplace categories", async () => {
        const res = await apiRequest("/api/admin/categories");
        assert.strictEqual(res.status, 200);
        assert.ok(Array.isArray(res.data));
        assert.ok(res.data.length >= 8);
        const homeCat = res.data.find(c => c.categoryName === "Home Services");
        assert.ok(homeCat);
    });

    // 7. Providers Discovery
    test("GET /api/providers returns verified providers with formatted category names", async () => {
        const res = await apiRequest("/api/providers");
        assert.strictEqual(res.status, 200);
        assert.ok(Array.isArray(res.data.providers));
        assert.ok(res.data.providers.length >= 1);

        const first = res.data.providers[0];
        assert.ok(first.category?.name);
        assert.strictEqual(typeof first.rating, "number");
    });

    // 8. Services Catalog
    test("GET /api/services returns active services with formatted provider names", async () => {
        const res = await apiRequest("/api/services");
        assert.strictEqual(res.status, 200);
        assert.ok(Array.isArray(res.data));
        assert.ok(res.data.length >= 1);

        const service = res.data[0];
        createdServiceId = service.id;
        assert.ok(service.title);
        assert.ok(service.category);
        assert.ok(service.providerName);
    });

    // 9. Provider Services & Availability Slots
    test("Provider can add an availability slot for future dates", async () => {
        const slotDate = new Date();
        slotDate.setDate(slotDate.getDate() + 10 + Math.floor(Math.random() * 50));
        slotDate.setHours(0, 0, 0, 0);

        const slotRes = await apiRequest("/api/availability", {
            method: "POST",
            token: providerToken,
            body: JSON.stringify({
                date: slotDate.toISOString(),
                startTime: "11:00 AM",
                endTime: "12:30 PM"
            })
        });
        assert.strictEqual(slotRes.status, 201);
        createdSlotId = slotRes.data.slot.id;

        // Verify slot is listed
        const getSlotsRes = await apiRequest(`/api/availability/provider/${providerId}`);
        assert.strictEqual(getSlotsRes.status, 200);
        assert.ok(Array.isArray(getSlotsRes.data));
        const created = getSlotsRes.data.find(s => s.id === createdSlotId);
        assert.ok(created);
    });

    // 10. Booking Lifecycle
    test("Customer creates booking -> Provider accepts -> Customer pays -> Provider completes", async () => {
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + 5);

        // A. Create Booking
        const bookingRes = await apiRequest("/api/bookings", {
            method: "POST",
            token: customerToken,
            body: JSON.stringify({
                providerId: providerId,
                serviceId: createdServiceId,
                slotId: createdSlotId,
                serviceDate: bookingDate.toISOString(),
                location: "123 Main Street, Suite 400, Macherla, AP 522426",
                latitude: 16.4800,
                longitude: 79.4300
            })
        });
        assert.strictEqual(bookingRes.status, 201);
        createdBookingId = bookingRes.data.booking.id;
        assert.strictEqual(bookingRes.data.booking.status, "PENDING");

        // B. Provider Accepts Booking
        const acceptRes = await apiRequest(`/api/bookings/${createdBookingId}/status`, {
            method: "PATCH",
            token: providerToken,
            body: JSON.stringify({ status: "ACCEPTED" })
        });
        assert.strictEqual(acceptRes.status, 200);
        assert.strictEqual(acceptRes.data.booking.status, "ACCEPTED");

        // C. Customer Creates Payment Order & Verifies
        const orderRes = await apiRequest("/api/payments/create-order", {
            method: "POST",
            token: customerToken,
            body: JSON.stringify({ bookingId: createdBookingId })
        });
        assert.strictEqual(orderRes.status, 200);
        assert.ok(orderRes.data.orderId);

        const verifyRes = await apiRequest("/api/payments/verify", {
            method: "POST",
            token: customerToken,
            body: JSON.stringify({
                bookingId: createdBookingId,
                razorpayOrderId: orderRes.data.orderId,
                razorpayPaymentId: `pay_test_${Date.now()}`,
                razorpaySignature: "sig_mock_verified",
                paymentMode: "WALLET"
            })
        });
        assert.strictEqual(verifyRes.status, 200);
        assert.strictEqual(verifyRes.data.payment.status, "SUCCESS");

        // D. Provider Completes Booking
        const completeRes = await apiRequest(`/api/bookings/${createdBookingId}/status`, {
            method: "PATCH",
            token: providerToken,
            body: JSON.stringify({ status: "COMPLETED" })
        });
        assert.strictEqual(completeRes.status, 200);
        assert.strictEqual(completeRes.data.booking.status, "COMPLETED");
    });

    // 11. Review Submission & Dynamic Rating Calculation
    test("Customer submits review for completed booking and provider rating recalculates", async () => {
        const reviewRes = await apiRequest("/api/reviews", {
            method: "POST",
            token: customerToken,
            body: JSON.stringify({
                bookingId: createdBookingId,
                rating: 5,
                comment: "Outstanding service! Arrived promptly and solved everything."
            })
        });
        assert.strictEqual(reviewRes.status, 201);
        assert.strictEqual(reviewRes.data.review.rating, 5);

        // Check provider rating updated
        const providerDetailRes = await apiRequest(`/api/providers/${providerId}`);
        assert.strictEqual(providerDetailRes.status, 200);
        assert.ok(providerDetailRes.data.rating >= 4.0);
    });

    // 12. Real-Time Chat & Socket.IO
    test("Chat REST API & Socket.IO WebSocket messaging flow", async () => {
        // A. Create Conversation via REST
        const convRes = await apiRequest("/api/chat/conversations", {
            method: "POST",
            token: customerToken,
            body: JSON.stringify({
                providerId: providerId,
                bookingId: createdBookingId
            })
        });
        assert.strictEqual(convRes.status, 200);
        testConversationId = convRes.data.conversation.id;
        assert.ok(testConversationId);

        // B. Connect Socket.IO client with Customer JWT
        const socket = ioClient(BASE_URL, {
            auth: { token: customerToken },
            transports: ["websocket"]
        });

        await new Promise((resolve, reject) => {
            socket.on("connect", resolve);
            socket.on("connect_error", reject);
            setTimeout(() => reject(new Error("Socket connection timeout")), 4000);
        });

        // C. Join conversation room
        await new Promise((resolve) => {
            socket.emit("join_conversation", { conversationId: testConversationId });
            socket.on("joined_conversation", resolve);
        });

        // D. Send message via WebSocket & receive event
        const receivedMessage = await new Promise((resolve, reject) => {
            socket.on("new_message", (msg) => {
                if (msg.message === "Hello from automated test suite!") {
                    resolve(msg);
                }
            });

            socket.emit("send_message", {
                conversationId: testConversationId,
                message: "Hello from automated test suite!"
            }, (ack) => {
                if (ack?.error) reject(new Error(ack.error));
            });

            setTimeout(() => reject(new Error("new_message timeout")), 4000);
        });

        assert.strictEqual(receivedMessage.message, "Hello from automated test suite!");
        socket.disconnect();

        // E. Verify message in REST message history
        const historyRes = await apiRequest(`/api/chat/conversations/${testConversationId}/messages`, {
            token: customerToken
        });
        assert.strictEqual(historyRes.status, 200);
        assert.ok(historyRes.data.messages.length >= 1);
        const last = historyRes.data.messages[historyRes.data.messages.length - 1];
        assert.strictEqual(last.message, "Hello from automated test suite!");
    });

    // 13. Admin Analytics & Bookings Overview
    test("Admin can view analytics overview and platform bookings", async () => {
        const analyticsRes = await apiRequest("/api/admin/analytics/overview", {
            token: adminToken
        });
        assert.strictEqual(analyticsRes.status, 200);
        assert.ok(analyticsRes.data.totalUsers >= 3);
        assert.ok(analyticsRes.data.totalBookings >= 1);
        assert.ok(analyticsRes.data.totalRevenue > 0);

        const bookingsRes = await apiRequest("/api/admin/bookings", {
            token: adminToken
        });
        assert.strictEqual(bookingsRes.status, 200);
        assert.ok(Array.isArray(bookingsRes.data));
        assert.ok(bookingsRes.data.length >= 1);
    });

    // 14. RBAC Guard Security Enforcement
    test("Customer cannot access Admin routes (returns 403 Forbidden)", async () => {
        const forbiddenRes = await apiRequest("/api/admin/users", {
            token: customerToken
        });
        assert.strictEqual(forbiddenRes.status, 403);
        assert.match(forbiddenRes.data.message, /Access denied/i);
    });

    // 15. Unauthenticated Request Guard
    test("Unauthenticated requests to protected endpoints return 401 Unauthorized", async () => {
        const unauthRes = await apiRequest("/api/users/profile");
        assert.strictEqual(unauthRes.status, 401);
        assert.match(unauthRes.data.message, /token is required/i);
    });

    // 16. Geolocation & Live Booking Tracking
    test("GET /api/bookings/:id/tracking returns live route, ETA, and coordinates", async () => {
        const trackingRes = await apiRequest(`/api/bookings/${createdBookingId}/tracking`, {
            token: customerToken
        });
        assert.strictEqual(trackingRes.status, 200);
        assert.strictEqual(trackingRes.data.bookingId, createdBookingId);
        assert.ok(trackingRes.data.customer?.coordinates);
        assert.ok(trackingRes.data.provider?.coordinates);
        assert.ok(trackingRes.data.route?.distanceKm);
        assert.ok(trackingRes.data.route?.formattedDuration);
    });
});
