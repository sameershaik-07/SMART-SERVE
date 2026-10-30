require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");

const authRoutes = require("./modules/auth/auth.routes");
const reviewRoutes = require("./modules/review/review.routes");
const userRoutes = require("./modules/users/users.routes");
const providerRoutes = require("./modules/providers/providers.routes");
const serviceRoutes = require("./modules/services/services.routes");
const availabilityRoutes = require("./modules/availability/availability.routes");
const bookingRoutes = require("./modules/bookings/bookings.routes");
const paymentRoutes = require("./modules/payments/payments.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const chatRoutes = require("./modules/chat/chat.routes");

const errorHandler = require("./middlewares/error.middleware");

const app = express();

// Trust reverse proxy (Vite dev proxy, Nginx, Cloudflare, cloud load balancers)
app.set("trust proxy", 1);

// Configure CORS for development and production environments
const configuredOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, server-to-server)
            if (!origin) return callback(null, true);
            if (configuredOrigins.length === 0 || configuredOrigins.includes("*") || configuredOrigins.includes(origin)) {
                return callback(null, true);
            }
            // Allow localhost during development or staging
            if (process.env.NODE_ENV !== "production" && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`CORS blocked request from origin: ${origin}`));
        },
        credentials: true
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security Response Headers
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
});

// Root Welcome Route
app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "Welcome to SMART-SERVE Backend API",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
    });
});

// Health check endpoint for uptime, DB, and resource verification
app.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return res.json({
            status: "healthy",
            uptime: Math.round(process.uptime()),
            database: "connected",
            environment: process.env.NODE_ENV || "development",
            memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(503).json({
            status: "unhealthy",
            uptime: Math.round(process.uptime()),
            database: "disconnected",
            error: err.message
        });
    }
});

// Domain Routes
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

// Catch-all 404 for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        message: `Endpoint ${req.method} ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
