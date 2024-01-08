const express = require("express");
const router = express.Router();
const userRouter = require("./users");
const companiesRouter = require("./companies");

router.use("/users", userRouter);
router.use("/companies", companiesRouter);

module.exports = router;
