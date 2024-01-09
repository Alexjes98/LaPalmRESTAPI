const express = require("express");
const router = express.Router();
const { batchController } = require("../controllers");

router.get("/", batchController.getAllBatches);
router.post("/", batchController.createBatch);

module.exports = router;
