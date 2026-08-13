// In-memory rate limiting middleware for authentication and sensitive routes
const rateLimitMap = new Map();

const rateLimiter = (options = { windowMs: 15 * 60 * 1000, max: 100, message: "Too many requests, please try again later." }) => {
    return (req, res, next) => {
        const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
        const now = Date.now();

        if (!rateLimitMap.has(ip)) {
            rateLimitMap.set(ip, { count: 1, startTime: now });
            return next();
        }

        const clientData = rateLimitMap.get(ip);

        if (now - clientData.startTime > options.windowMs) {
            // Reset window
            rateLimitMap.set(ip, { count: 1, startTime: now });
            return next();
        }

        clientData.count += 1;

        if (clientData.count > options.max) {
            return res.status(429).json({
                message: options.message
            });
        }

        next();
    };
};

module.exports = rateLimiter;
