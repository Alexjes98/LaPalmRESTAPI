const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/resetPasswordRequest", userController.resetPasswordRequest);
router.post("/resetPassword", userController.resetPassword);

module.exports = router;
