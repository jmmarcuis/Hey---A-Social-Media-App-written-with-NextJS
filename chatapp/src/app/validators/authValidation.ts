// src/validations/authValidation.ts
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
  profile: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  }),
  username: z.string().min(3, "Username too short"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include letters, numbers, and at least one special character"
    ),
  dateOfBirth: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date of birth must be in the format YYYY-MM-DD"
    )
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
});

// Infer types from the schemas
export type LoginPayload = z.infer<typeof loginSchema>;
export type RegisterPayload = z.infer<typeof registerSchema>;
