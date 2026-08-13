const { ZodError } = require("zod");

/**
 * Global Centralized Error Handling Middleware for Express
 */
const errorHandler = (err, req, res, next) => {
    console.error("❌ ERROR HANDLER:", err);

    // 1. Zod Input Validation Error
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation Error",
            errors: err.errors.map(e => ({
                field: e.path.join("."),
                message: e.message
            }))
        });
    }

    // 2. Prisma Database Errors
    if (err.code === "P2002") {
        const target = err.meta?.target ? err.meta.target.join(", ") : "field";
        return res.status(409).json({
            message: `A record with this ${target} already exists.`
        });
    }

    if (err.code === "P2025") {
        return res.status(404).json({
            message: "The requested resource was not found."
        });
    }

    // 3. JWT Token Errors
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({
            message: "Invalid or expired token. Please log in again."
        });
    }

    // 4. Custom Application Status Errors
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        message
    });
};

module.exports = errorHandler;
