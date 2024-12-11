import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

interface DecodedToken {
  userId: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: "Invalid token format" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: "Invalid token" });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: "Token expired" });
    } else {
      console.error("Authentication error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  }
};
