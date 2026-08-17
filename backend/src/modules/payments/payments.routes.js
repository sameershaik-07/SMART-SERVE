const express = require("express");
const router = express.Router();
const paymentController = require("./payments.controller");
const authenticate = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.post("/create-order", authenticate, authorize("CUSTOMER"), paymentController.createOrder);
router.post("/verify", authenticate, authorize("CUSTOMER"), paymentController.verify);
router.get("/booking/:bookingId", authenticate, paymentController.getByBooking);
router.post("/:bookingId/refund", authenticate, paymentController.refund);

module.exports = router;
