const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const validateToken = require("../middlewares/auth");

router.get("/", userController.getAllUsers);
router.get("/:id", validateToken, userController.getUserById);
router.post("/", userController.createUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
