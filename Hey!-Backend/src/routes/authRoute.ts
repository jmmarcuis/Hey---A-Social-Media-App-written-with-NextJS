import { Router } from 'express';
import { validateData } from '../middleware/validationMiddleware.js';
import AuthValidator from '../validation/authValidator.js';
import authController from '../controller/authController.js';

const router = Router();

router.post('/register', validateData(AuthValidator.RegisterSchema), authController.register);
router.post('/verify-email', validateData(AuthValidator.VerifyEmailSchema), authController.verifyEmail);
router.post('/cancel-verification', validateData(AuthValidator.CancelVerificationSchema), authController.cancelVerification);
router.post('/resend-otp', validateData(AuthValidator.ResendOTPSchema), authController.resendOTP);
router.post('/login', validateData(AuthValidator.LoginSchema), authController.login);
router.get('/verify-token', authController.verifyToken); 

export default router;
