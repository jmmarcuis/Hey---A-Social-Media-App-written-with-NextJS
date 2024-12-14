// src/types/Users.ts
"use client"
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

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Authentication response interfaces
export interface AuthResponse {
  message: string;
  tokens: TokenPair;
  user: {
    verification: { isVerified: boolean; otp?: { code: string; expiresAt: Date; } | undefined; };
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
  };
}
// Current authenticated user state
export type AuthUser = Pick<User, 'id' | 'email' | 'username'> & {
  verification: {
    isVerified: boolean;
    otp?: {
      code: string;
      expiresAt: Date;
    };
  };
  tokens: TokenPair;



};