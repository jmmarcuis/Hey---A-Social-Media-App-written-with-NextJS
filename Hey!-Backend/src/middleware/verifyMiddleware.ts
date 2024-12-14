import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/userModel.js';

// Middleware to check if the user is verified
export const verifyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Ensure the user is already attached to the request by `authMiddleware`
    const user = req.user as IUser;

    if (!user) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      return;
    }

    // Check if the user is verified
    if (!user.verification.isVerified) {
      res.status(403).json({ message: 'Forbidden: User not verified' });
      return;
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error in verifyMiddleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
