const express = require("express");
const router = express.Router();
const { companiesController } = require("../controllers");

router.get("/", companiesController.getAllCompanies);
router.post("/", companiesController.createCompany);

module.exports = router;
