const express = require("express");
const router = express.Router();
const providerController = require("./providers.controller");
const authenticate = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", providerController.getProviders);
router.get("/dashboard", authenticate, authorize("PROVIDER"), providerController.getDashboardStats);
router.get("/:id", providerController.getProviderById);
router.put("/profile", authenticate, authorize("PROVIDER"), providerController.updateProfile);

module.exports = router;
