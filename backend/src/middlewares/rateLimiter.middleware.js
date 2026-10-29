const ApiError = require("../utils/errors");

// In-memory rate limiting map with automatic TTL-based cleanup
const rateLimitMap = new Map();

// Periodic cleanup every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
        if (now - data.startTime > 30 * 60 * 1000) {
            rateLimitMap.delete(ip);
        }
    }
}, CLEANUP_INTERVAL_MS);

// Allow Node.js to exit gracefully without waiting for this interval
if (cleanupTimer.unref) {
    cleanupTimer.unref();
}

const rateLimiter = (options = {}) => {
    const windowMs = options.windowMs || 15 * 60 * 1000;
    const max = options.max || 100;
    const message = options.message || "Too many requests. Please try again later.";

    return (req, res, next) => {
        // Extract real client IP even behind proxies/load balancers
        let rawIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip || "unknown";
        if (typeof rawIp === "string" && rawIp.includes(",")) {
            rawIp = rawIp.split(",")[0].trim();
        }
        const ip = rawIp;
        const now = Date.now();

        if (!rateLimitMap.has(ip)) {
            rateLimitMap.set(ip, { count: 1, startTime: now });
            return next();
        }

        const clientData = rateLimitMap.get(ip);

        if (now - clientData.startTime > windowMs) {
            // Reset window
            rateLimitMap.set(ip, { count: 1, startTime: now });
            return next();
        }

        clientData.count += 1;

        if (clientData.count > max) {
            return next(ApiError.tooManyRequests(message));
        }

        next();
    };
};

module.exports = rateLimiter;
