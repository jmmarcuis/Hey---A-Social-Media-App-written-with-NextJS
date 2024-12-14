// src/validations/authValidation.ts
"use client"
import { z } from "zod";

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
});

// Register validation schema
export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include letters, numbers, and at least one special character"
    ),
  confirmPassword: z.string().min(1, "Confirm Password is required")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],  
});
 

// OTP validation schema
export const otpVerificationSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string()
    .min(6, "OTP must be at least 6 characters")
    .max(6, "OTP must be exactly 6 characters")
    .regex(/^\d+$/, "OTP must contain only numbers")
});

// Auth-specific interfaces using Zod inference
export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterCredentials = z.infer<typeof registerSchema>;
 

// Infer types from the schemas
export type LoginPayload = z.infer<typeof loginSchema>;
export type RegisterPayload = z.infer<typeof registerSchema>;
export type OtpVerificationPayload = z.infer<typeof otpVerificationSchema>;
