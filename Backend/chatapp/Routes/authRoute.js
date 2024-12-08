const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController");

router.post("/register", authController.register);
router.post('/verify', authController.verifyEmail);
router.post('/verify/cancel', authController.cancelVerification)
router.post('/resend-otp', authController.resendOTP)
router.post('/login', authController.login)
router.get('/verify-token', authController.verifyToken);

module.exports = router;
