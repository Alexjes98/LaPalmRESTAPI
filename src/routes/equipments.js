const express = require("express");
const router = express.Router();
const { equipmentController } = require("../controllers");

router.get("/", equipmentController.getAllEquipments);
router.post("/", equipmentController.createEquipment);

module.exports = router;
