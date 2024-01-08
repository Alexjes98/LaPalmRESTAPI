const express = require("express");
const router = express.Router();
const { frontController } = require("../controllers");

router.get("/", frontController.getAllFronts);
router.post("/", frontController.createFront);

module.exports = router;
