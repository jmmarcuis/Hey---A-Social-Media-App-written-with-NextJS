import jwt from 'jsonwebtoken';
import mongoose, { Schema } from 'mongoose';
import User, { IUser } from '../models/userModel.js';
import { TokenPayload } from '../types/tokenPayload.js';

 
// Generate JWT Token
export const generateToken = (user: IUser): string => {
  const payload: TokenPayload = {
    _id: user._id,        
    username: user.username,
    email: user.email,
    isVerified: user.verification.isVerified,
  };
  const secret = process.env.JWT_SECRET || 'e76d54d608cde2e8563bf6d1812d9e3eaa25d26038e367882844f137864c2c46';
  const options = { expiresIn: '1h' };
  return jwt.sign(payload, secret, options);
};

// Validate JWT Token
export const verifyToken = (token: string): TokenPayload | null => {
  const secret = process.env.JWT_SECRET || 'e76d54d608cde2e8563bf6d1812d9e3eaa25d26038e367882844f137864c2c46';
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

// Invalidate JWT Token (Optional, for token revocation)
const invalidatedTokens: Set<string> = new Set();

export const invalidateToken = (token: string): void => {
  invalidatedTokens.add(token);
};

// Check if Token is Invalidated
export const isTokenInvalidated = (token: string): boolean => {
  return invalidatedTokens.has(token);
};
