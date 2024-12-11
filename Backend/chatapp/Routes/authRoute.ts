import express, { NextFunction } from 'express';
import { validateData } from '../Middleware/validationMiddleware.js';
import {
  register,
  verifyEmail,
  cancelVerification,
  resendOTP,
  login,
  verifyToken,
} from '../Controller/authController.js';
import {
  RegisterSchema,
  LoginSchema,
  VerifyEmailSchema,
  ResendOTPSchema,
  CancelVerificationSchema,
  TokenVerificationSchema,
} from '../Validation/authValidator.js';

const userRouter = express.Router();

userRouter.post("/register", validateData(RegisterSchema), register);
userRouter.post("/verify", validateData(VerifyEmailSchema), verifyEmail);
userRouter.post("/verify/cancel", validateData(CancelVerificationSchema), cancelVerification);
userRouter.post("/resend-otp", validateData(ResendOTPSchema), resendOTP);
userRouter.post("/login", validateData(LoginSchema), login);
userRouter.get("/verify-token", validateData(TokenVerificationSchema), verifyToken);

export default userRouter;