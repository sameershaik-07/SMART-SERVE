const express = require("express");
const router = express.Router();
const availabilityController = require("./availability.controller");
const authenticate = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/provider/:providerId", availabilityController.getProviderSlots);
router.post("/", authenticate, authorize("PROVIDER"), availabilityController.create);
router.put("/:id", authenticate, authorize("PROVIDER"), availabilityController.update);
router.delete("/:id", authenticate, authorize("PROVIDER"), availabilityController.remove);

module.exports = router;
