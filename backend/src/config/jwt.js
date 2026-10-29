const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "smartserve_secure_jwt_secret_key_2026_production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || "30d";

const signAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

const signRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
};

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = {
    JWT_SECRET,
    JWT_EXPIRE,
    REFRESH_TOKEN_EXPIRE,
    signAccessToken,
    signRefreshToken,
    verifyToken
};

