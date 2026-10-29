const { verifyToken } = require("../config/jwt");
const ApiError = require("../utils/errors");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next(ApiError.unauthorized("Authentication token is required"));
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : authHeader.split(" ")[1];

        if (!token) {
            return next(ApiError.unauthorized("Authentication token is required"));
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return next(ApiError.unauthorized("Invalid or expired token"));
    }
};

module.exports = authenticate;
