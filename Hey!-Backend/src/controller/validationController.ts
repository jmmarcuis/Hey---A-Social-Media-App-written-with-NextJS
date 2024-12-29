
import { Request, Response } from 'express';
import User, { IUser } from '../models/userModel.js';


const validationController = {

    // Check if user is verified
    isVerified: async (req: Request, res: Response): Promise<any> => {
        try {
            const user = req.user as IUser;
            const userVerificationStatus = {
                verification: {
                    verification: user.verification?.isVerified,
                },
            };
            res.status(200).json({
                success: true,
                userVerificationStatus
            });
        } catch (error) {
            console.error('Error in getProfile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Check if user has completed their profile
    isProfileComplete: async (req: Request, res: Response): Promise<any> => {
        try {

            const user = req.user as IUser;
            const userProfileStatus = {
              isComplete: user.profile.isComplete
            };
            res.status(200).json({
                success: true,
                userProfileStatus
            });
        } catch (error) {
            console.error('Error in getProfile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }

    },
}
export default validationController;