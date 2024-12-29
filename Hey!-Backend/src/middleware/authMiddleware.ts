// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken, isTokenInvalidated } from '../utility/authUtility.js';
import User from '../models/userModel.js'; // Import your user model

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Token missing or invalid' });
        }

        if (isTokenInvalidated(token)) {
            return res.status(403).json({ success: false, message: 'Token is invalidated' });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded._id) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }

        // Fetch the user from the database
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Error in authMiddleware:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
