// src/validations/profileValidation.ts
"use client"
import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string()
    .min(3, "First name must be at least 3 characters or longer")
    .max(30, "First name too long")
    .trim(),
  lastName: z.string()
    .min(3, "Last name must be at least 3 characters or longer")
    .max(30, "Last name too long")
    .trim(),
  bio: z.string()
    .max(500, "Bio is too long"),
  profilePicture: z.string()
    .optional(), // Allow null or undefined to enable default value in Mongoose
  coverPicture: z.string()
    .optional(), // Allow null or undefined to enable default value in Mongoose
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.date()
});


export type ProfilePayload = z.infer<typeof profileSchema>;