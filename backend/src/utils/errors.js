/**
 * Standardized Application API Error class
 * Provides semantic HTTP status codes and structured payloads
 */
class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(msg = "Bad Request", errors = []) {
        return new ApiError(400, msg, errors);
    }

    static unauthorized(msg = "Unauthorized access") {
        return new ApiError(401, msg);
    }

    static forbidden(msg = "Forbidden access: Insufficient permissions") {
        return new ApiError(403, msg);
    }

    static notFound(msg = "Resource not found") {
        return new ApiError(404, msg);
    }

    static conflict(msg = "Resource conflict") {
        return new ApiError(409, msg);
    }

    static tooManyRequests(msg = "Too many requests. Please try again later.") {
        return new ApiError(429, msg);
    }

    static internal(msg = "Internal server error") {
        return new ApiError(500, msg);
    }
}

module.exports = ApiError;

