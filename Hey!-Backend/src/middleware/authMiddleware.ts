import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/userModel.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const TOKEN_CONFIG = {
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET as string,
};

interface TokenPayload {
  id: string;
  email: string;
  type: 'access' | 'refresh';
}


export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token, 
      TOKEN_CONFIG.ACCESS_TOKEN_SECRET
    ) as TokenPayload;

    // Ensure it's an access token
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find user
    const user = await User.findOne({
      _id: decoded.id,
      email: decoded.email,
    }).select('-password -verification.otp');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or token invalid'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};
 

// Middleware to check if user is verified
export const verifiedUserMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!req.user.verification.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'User account is not verified'
      });
    }

    next();
  } catch (error) {
    console.error('Verification check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Verification check failed'
    });
  }
};

// Middleware to check if user is active (not blocked or has recent activity)
export const activeUserMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if user is in blocked list of any other user
    const isBlocked = await User.findOne({
      'social.blocked.user': req.user._id
    });

    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'User account is currently restricted'
      });
    }

    next();
  } catch (error) {
    console.error('Active user check error:', error);
    return res.status(500).json({
      success: false,
      message: 'User activity check failed'
    });
  }
};