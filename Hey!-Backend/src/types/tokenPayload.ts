import mongoose, { Schema } from "mongoose";

export interface TokenPayload {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    isVerified: boolean;
  }

  