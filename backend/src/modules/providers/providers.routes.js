const express = require("express");
const router = express.Router();
const providerController = require("./providers.controller");
const authenticate = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/dashboard", authenticate, authorize("PROVIDER"), providerController.getDashboardStats);
router.put("/profile", authenticate, authorize("PROVIDER"), providerController.updateProfile);
router.get("/", providerController.getProviders);
router.get("/:id", providerController.getProviderById);

module.exports = router;
