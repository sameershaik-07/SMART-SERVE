const express = require("express");
const router = express.Router();
const servicesController = require("./services.controller");
const authenticate = require("../../middlewares/auth.middleware");
const authorize = require("../../middlewares/role.middleware");

router.get("/", servicesController.getAllServices);
router.get("/provider/:providerId", servicesController.getProviderServices);
router.post("/", authenticate, authorize("PROVIDER"), servicesController.create);
router.put("/:id", authenticate, authorize("PROVIDER"), servicesController.update);
router.delete("/:id", authenticate, authorize("PROVIDER"), servicesController.remove);

module.exports = router;
