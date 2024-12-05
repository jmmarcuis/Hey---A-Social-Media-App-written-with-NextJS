const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController");

router.post("/register", authController.register);
router.post('/verify', authController.verifyEmail);
router.post('/resendOTP', authController.resendOTP)
router.post('/login', authController.login)

module.exports = router;
