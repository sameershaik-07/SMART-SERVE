const express = require("express");
const router = express.Router();
const userController = require("./users.controller");
const authenticate = require("../../middlewares/auth.middleware");

router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, userController.updateProfile);
router.put("/change-password", authenticate, userController.changePassword);

module.exports = router;
