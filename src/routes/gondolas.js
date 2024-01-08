const express = require("express");
const router = express.Router();
const { gondolaController } = require("../controllers");

router.get("/", gondolaController.getAllGondolas);
router.post("/", gondolaController.createGondola);

module.exports = router;
