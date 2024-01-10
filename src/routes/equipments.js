const express = require("express");
const router = express.Router();
const { equipmentController } = require("../controllers");

router.get("/", equipmentController.getAllEquipments);
router.get("/company/:id", equipmentController.getEquipmentsByCompany);
router.get(
  "/company/:companyId/equipment/:id",
  equipmentController.getEquipmentById
);
router.post("/", equipmentController.createEquipment);

module.exports = router;
