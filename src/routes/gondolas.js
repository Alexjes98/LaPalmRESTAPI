const express = require("express");
const router = express.Router();
const { gondolaController } = require("../controllers");

router.get("/", gondolaController.getAllGondolas);
router.get("/company/:id", gondolaController.getGondolasByCompany);
router.get("/company/:companyId/gondola/:id", gondolaController.getGondolaById);
router.post("/", gondolaController.createGondola);

module.exports = router;
