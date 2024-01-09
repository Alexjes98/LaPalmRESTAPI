const express = require("express");
const router = express.Router();
const { dailyRegisterController } = require("../controllers");

router.get("/", dailyRegisterController.getAllDailyRegisters);
router.post("/", dailyRegisterController.createDailyRegister);

module.exports = router;
