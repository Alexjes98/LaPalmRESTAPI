const express = require("express");
const router = express.Router();
const userRouter = require("./users");
const companiesRouter = require("./companies");
const gondolasRouter = require("./gondolas");
const frontsRouter = require("./fronts");
const positionsRouter = require("./positions");
const equipmentsRouter = require("./equipments");
const employeesRouter = require("./employees");
const batchesRouter = require("./batches");
const dailyRegistersRouter = require("./daily_registers");

router.use("/users", userRouter);
router.use("/companies", companiesRouter);
router.use("/gondolas", gondolasRouter);
router.use("/fronts", frontsRouter);
router.use("/positions", positionsRouter);
router.use("/equipments", equipmentsRouter);
router.use("/employees", employeesRouter);
router.use("/batches", batchesRouter);
router.use("/daily_registers", dailyRegistersRouter);

module.exports = router;