const express = require("express");
const router = express.Router();
const { batchController } = require("../controllers");

router.get("/", batchController.getAllBatches);
router.get("company/:id", batchController.getBatchesByCompany);
router.get("company/:id/batch/:id", batchController.getBatchById);
router.post("/", batchController.createBatch);

module.exports = router;
