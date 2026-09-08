const express = require("express");
const router = express.Router();
const bookingController = require("./bookings.controller");
const authenticate = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.post("/", authenticate, authorize("CUSTOMER"), bookingController.create);
router.get("/customer", authenticate, authorize("CUSTOMER"), bookingController.getCustomerBookings);
router.get("/provider", authenticate, authorize("PROVIDER"), bookingController.getProviderBookings);
router.get("/:id", authenticate, bookingController.getById);
router.get("/:id/tracking", authenticate, bookingController.getTracking);
router.patch("/:id/status", authenticate, bookingController.updateStatus);
router.patch("/:id/location", authenticate, bookingController.updateLocation);

module.exports = router;
