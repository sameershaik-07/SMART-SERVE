const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const rateLimiter = require("../../middlewares/rateLimiter.middleware");

// Sensitive auth endpoints protected by rate limiting
const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too many authentication attempts. Please try again after 15 minutes."
});

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/verify-email", authController.verifyEmail);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);
router.post("/refresh", authController.refreshToken);

module.exports = router;
