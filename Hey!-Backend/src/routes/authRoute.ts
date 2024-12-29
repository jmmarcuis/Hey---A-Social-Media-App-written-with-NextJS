import { Router } from 'express';
import { validateData } from '../middleware/validationMiddleware.js';
import AuthValidator from '../validation/authValidator.js';
import authController from '../controller/authController.js';
import { 
    authMiddleware, 
  } from '../middleware/authMiddleware.js';

const router = Router();

// Registration
router.post('/register', validateData(AuthValidator.RegisterSchema), authController.register);

// Verification
router.post('/verify', validateData(AuthValidator.VerifyEmailSchema) , authMiddleware, authController.verifyEmail);
router.post('/verify/cancel', validateData(AuthValidator.CancelVerificationSchema) , authController.cancelVerification);
router.post('/resend-otp', validateData(AuthValidator.ResendOTPSchema),   authMiddleware, authController.resendOTP);

// Authentication
router.post('/login', validateData(AuthValidator.LoginSchema), authController.login);
// router.post('/logout', authController.logout);

// Token Related API
// ! TEMPORARILY DISABLED WE WILL UTILIZE A SIMPLER CLIENT SIDE REF
// router.post('/refresh-token', authController.refreshToken);
// router.get('/verify-token', authController.verifyToken); 

// ! Test Routes
// ! DEFUNCT
// router.get('/authenticatd-only', authMiddleware);
// router.get('/authenticated-and-verified', authMiddleware, verifyMiddleware);
 
export default router;
