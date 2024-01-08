const express = require("express");
const router = express.Router();
const userRouter = require("./users");
const companiesRouter = require("./companies");
const gondolasRouter = require("./gondolas");
const frontsRouter = require("./fronts");

router.use("/users", userRouter);
router.use("/companies", companiesRouter);
router.use("/gondolas", gondolasRouter);
router.use("/fronts", frontsRouter);

module.exports = router;