"use client"
import { z } from "zod";
import { loginSchema, registerSchema, otpVerificationSchema  } from "../validators/authValidation";

export interface User {
  id: string;
  username: string;
  email: string;
  verification: {
    isVerified: boolean;
    otp?: {
      code: string;
      expiresAt: Date;
    };
  };
  profile: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    profilePicture?: string;
    coverPicture?: string;
    gender?: "male" | "female" | "other";
    dateOfBirth?: Date;
  };
  social: {
    friends: Array<{
      user: string;
      status: "pending" | "accepted";
      createdAt: Date;
    }>;
    blocked: Array<{
      user: string;
      createdAt: Date;
    }>;
  };
  stats: {
    postsCount: number;
    friendsCount: number;
  };
  lastActive?: Date;
  registeredAt: Date;
  lastLogin?: Date;
}

// Auth-specific interfaces using Zod inference
export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterCredentials = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
export type RegisterPayload = z.infer<typeof registerSchema>;
export type OtpVerificationPayload = z.infer<typeof otpVerificationSchema>;

// Authentication response interfaces
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Current authenticated user state
export type AuthUser = Pick<User, 'id' | 'email' | 'username'> & {
  token: string;
  verification: {
    isVerified: boolean;
    otp?: {
      code: string;
      expiresAt: Date;
    };
  };
};