const express = require("express");
const router = express.Router();
const { dailyRegisterController } = require("../controllers");

router.get("/", dailyRegisterController.getAllDailyRegisters);
router.get(
  "/company/:id",
  dailyRegisterController.getDailyRegistersByCompanyId
);
router.get(
  "/company/:id/today",
  dailyRegisterController.getTodayDailyRegistersByCompanyId
);
router.post("/", dailyRegisterController.createDailyRegister);

module.exports = router;
