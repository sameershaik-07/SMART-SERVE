const express = require("express");
const authenticate = require("../../middlewares/auth.middleware");
const { createReviewController } = require("./review.controller");

const router = express.Router();

router.post("/", authenticate, createReviewController);

module.exports = router;