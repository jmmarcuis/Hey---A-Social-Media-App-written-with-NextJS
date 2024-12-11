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