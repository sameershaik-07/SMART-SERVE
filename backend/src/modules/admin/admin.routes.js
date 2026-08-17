const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const authenticate = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

// Categories (Public GET, Admin CRUD)
router.get("/categories", adminController.getCategories);
router.post("/categories", authenticate, authorize("ADMIN"), adminController.createCategory);
router.put("/categories/:id", authenticate, authorize("ADMIN"), adminController.updateCategory);
router.delete("/categories/:id", authenticate, authorize("ADMIN"), adminController.deleteCategory);

// Provider Verification Queue (Admin Protected)
router.get("/providers/pending", authenticate, authorize("ADMIN"), adminController.getPendingProviders);
router.patch("/providers/:id/verify", authenticate, authorize("ADMIN"), adminController.verifyProvider);
router.patch("/providers/:id/reject", authenticate, authorize("ADMIN"), adminController.rejectProvider);

// Analytics & Audit Logs (Admin Protected)
router.get("/analytics/overview", authenticate, authorize("ADMIN"), adminController.getAnalytics);
router.get("/audit-log", authenticate, authorize("ADMIN"), adminController.getAuditLogs);

module.exports = router;
