// src/types/Auth.ts
export interface Token {
  token: string;
}

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

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface VerifiedResponse{
  success: boolean;
  userVerificationStatus:{
  verification: {
    isVerified: boolean;
}};
}

export interface CompleteProfileResponse{
  success:boolean;
  userProfileStatus:{
    isComplete:boolean;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  verification: {
      isVerified: boolean;
      otp?: {
          code: string;
          expiresAt: Date;
      };
  };
}