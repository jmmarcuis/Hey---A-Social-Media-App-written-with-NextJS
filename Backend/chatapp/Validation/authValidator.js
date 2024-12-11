// userValidation.ts
import { z } from 'zod';
// Schema for registration (stricter, specific to registration)
export const RegisterSchema = z.object({
    username: z.string().min(3).max(20).trim(),
    email: z.string().email(),
    password: z.string().min(8),
});
// Schema for login
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});
// Schema for email verification
export const VerifyEmailSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6) // Assuming 6-digit OTP
});
// Schema for resending OTP
export const ResendOTPSchema = z.object({
    email: z.string().email()
});
// Schema for canceling verification
export const CancelVerificationSchema = z.object({
    email: z.string().email()
});
// Schema for verifying
export const TokenVerificationSchema = z.object({
    email: z.string().email()
});
