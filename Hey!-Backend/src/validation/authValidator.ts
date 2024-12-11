import { z } from 'zod';

const AuthValidator = {
  RegisterSchema: z.object({
    username: z.string().min(3).max(20).trim(),
    email: z.string().email(),
    password: z.string().min(8),
  }),

  LoginSchema: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),

  VerifyEmailSchema: z.object({
    email: z.string().email(),
    otp: z.string().length(6), // Assuming 6-digit OTP
  }),

  ResendOTPSchema: z.object({
    email: z.string().email(),
  }),

  CancelVerificationSchema: z.object({
    email: z.string().email(),
  }),

  TokenVerificationSchema: z.object({
    email: z.string().email(),
  })

  // Verify token API does not need an verification schema since it only checks if
  // Token recieved in the header is still valid
};

export default AuthValidator;
