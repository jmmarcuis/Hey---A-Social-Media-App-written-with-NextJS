import User, { IUser } from '../models/userModel.js';
import { Request, Response } from 'express';
import configureCloudinary from '../config/cloudinaryConfig.js';
import profileValidator from '../validation/profileValidator.js';

const cloudinary = configureCloudinary();

export const profileController = {
    // Get the user's profile
    getProfile: async (req: Request, res: Response): Promise<any> => {
        try {
            const user = req.user as IUser;

            // Structure the response to include the desired fields
            const userProfile = {
                username: user.username,
                email: user.email,
                verification: {
                    verification: user.verification?.isVerified,
 
                  
                },
            };

            res.status(200).json(userProfile);
        } catch (error) {
            console.error('Error in getProfile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Complete a newly verified user's account
         completeProfile: async (req: Request, res: Response): Promise<any> => {
        try {
            const user = req.user as IUser;

            // Extract and validate data from the request body
            const {
                firstName,
                lastName,
                bio,
                profilePicture,
                coverPicture,
                gender,
                dateOfBirth,
            } = req.body;

            // Upload images to Cloudinary if provided
            const uploadedProfilePicture = profilePicture
                ? await cloudinary.uploader.upload(profilePicture, {
                      folder: 'profile_pictures',
                  })
                : null;

            const uploadedCoverPicture = coverPicture
                ? await cloudinary.uploader.upload(coverPicture, {
                      folder: 'cover_pictures',
                  })
                : null;

             // Update user profile in the database
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    'profile.firstName': firstName,
                    'profile.lastName': lastName,
                    'profile.bio': bio,
                    'profile.profilePicture': uploadedProfilePicture?.secure_url || user.profile?.profilePicture,
                    'profile.coverPicture': uploadedCoverPicture?.secure_url || user.profile?.coverPicture,
                    'profile.gender': gender,
                    'profile.dateOfBirth': dateOfBirth,
                },
            },
            { new: true } // Return the updated document
        );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json({
                message: 'Profile completed successfully.',
                user: updatedUser,
            });
        } catch (error) {
            console.error('Error in completeProfile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },


    
    // Update profile
    updateProfile : async (req: Request, res: Response): Promise<any> => {


        try{

        } catch{

        }

    },

    
}