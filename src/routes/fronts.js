const express = require("express");
const router = express.Router();
const { frontController } = require("../controllers");

router.get("/", frontController.getAllFronts);
router.get("/company/:id", frontController.getFrontsByCompany);
router.get("/company/:companyId/front/:id", frontController.getFrontById);
router.post("/", frontController.createFront);

module.exports = router;
