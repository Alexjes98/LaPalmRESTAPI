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

const authRouter = require("./auth");

const validateToken = require("../middlewares/auth");

router.use("/users", validateToken, userRouter);
router.use("/companies", validateToken, companiesRouter);
router.use("/gondolas", validateToken, gondolasRouter);
router.use("/fronts", validateToken, frontsRouter);
router.use("/positions", validateToken, positionsRouter);
router.use("/equipments", validateToken, equipmentsRouter);
router.use("/employees", validateToken, employeesRouter);
router.use("/batches", validateToken, batchesRouter);
router.use("/daily_registers", validateToken, dailyRegistersRouter);
router.use("/auth", authRouter);

module.exports = router;