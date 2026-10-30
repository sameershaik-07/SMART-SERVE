const { ZodError } = require("zod");
const ApiError = require("../utils/errors");

/**
 * Global Centralized Error Handling Middleware for Express
 */
const errorHandler = (err, req, res, next) => {
    // 1. Custom Application ApiError
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            message: err.message,
            errors: err.errors && err.errors.length > 0 ? err.errors : undefined
        });
    }

    // 2. Zod Input Validation Error
    if (err instanceof ZodError || Array.isArray(err.issues)) {
        const issues = Array.isArray(err.issues) ? err.issues : [];
        return res.status(400).json({
            message: "Validation Error",
            errors: issues.map((e) => ({
                field: Array.isArray(e.path) ? e.path.join(".") : "",
                message: e.message || "Invalid value"
            }))
        });
    }

    // 3. Prisma Database Errors
    if (err.code === "P2002") {
        const target = Array.isArray(err.meta?.target)
            ? err.meta.target.join(", ")
            : err.meta?.target || "field";

        return res.status(409).json({
            message: `A record with this ${target} already exists.`
        });
    }

    if (err.code === "P2025") {
        return res.status(404).json({
            message: "The requested resource was not found."
        });
    }

    if (err.code === "P2003") {
        return res.status(400).json({
            message: "Invalid relational reference (foreign key constraint failed)."
        });
    }

    // 3.5. Prisma Database Connection / Initialization Errors
    if (
        err.name === "PrismaClientInitializationError" ||
        err.constructor?.name === "PrismaClientInitializationError" ||
        (typeof err.message === "string" && (
            err.message.includes("Can't reach database server") ||
            err.message.includes("Connection refused") ||
            err.message.includes("PrismaClientInitializationError")
        ))
    ) {
        return res.status(503).json({
            message: "Database service unavailable. Please make sure the PostgreSQL database is running."
        });
    }

    // 4. JWT Token Errors
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({
            message: "Invalid or expired token. Please log in again."
        });
    }

    // 5. Fallback for unhandled server errors
    console.error("❌ UNHANDLED INTERNAL ERROR:", err);
    const statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Internal Server Error";

    // Never leak raw stack traces, local paths, or internal Prisma code snippets
    if (statusCode === 500 || message.includes("invocation in") || message.includes("prisma.")) {
        message = process.env.NODE_ENV === "production"
            ? "Internal Server Error"
            : "An unexpected database or server error occurred.";
    }

    return res.status(statusCode).json({
        message
    });
};

module.exports = errorHandler;
