const express = require("express");
const router = express.Router();
const chatController = require("./chat.controller");
const authenticate = require("../../middlewares/auth.middleware");

// All chat routes require valid JWT authentication
router.use(authenticate);

// Conversations
router.post("/conversations", chatController.getOrCreateConversation);
router.get("/conversations", chatController.getUserConversations);

// Messages
router.get("/conversations/:id/messages", chatController.getConversationMessages);
router.post("/conversations/:id/messages", chatController.sendMessage);
router.patch("/conversations/:id/read", chatController.markAsRead);

module.exports = router;

