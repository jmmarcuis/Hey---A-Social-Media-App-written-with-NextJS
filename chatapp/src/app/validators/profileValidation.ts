// src/validations/profileValidation.ts
"use client"
import { z } from 'zod';

const MIN_AGE = 13;
const today = new Date();
const minDate = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());

// Custom URL validator for Cloudinary URLs
const cloudinaryUrlSchema = z.string()
  .url("Must be a valid URL")
  .regex(/^https?:\/\/.*cloudinary\.com\/.*/, "Must be a Cloudinary URL")
  .optional()
  .or(z.literal(''));

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
  profilePicture: cloudinaryUrlSchema,
  coverPicture: cloudinaryUrlSchema,
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.date()
    .max(today, "Date of birth cannot be in the future")
    .refine(date => date <= minDate, {
      message: `You must be at least ${MIN_AGE} years old`,
    }),
});

export type ProfilePayload = z.infer<typeof profileSchema>;