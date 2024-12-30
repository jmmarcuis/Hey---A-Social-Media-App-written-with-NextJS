import Users, { IUser } from '../models/userModel.js';
import { Request, Response } from 'express';
import configureCloudinary from '../config/cloudinaryConfig.js';
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
                bio:user.profile?.bio,
                profilePicture:user.profile?.profilePicture,
                coverPicture:user.profile?.coverPicture
            };

            res.status(200).json(userProfile);
        } catch (error) {
            console.error('Error in getProfile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Complete a newly verified user's account
    completeProfile: async (req: Request, res: Response) : Promise<any> => {
        try {
          const userId = req.user?._id; // Assume authMiddleware attaches user info
          const { firstName, lastName, bio, gender, dateOfBirth } = req.body;
      
          // Multer files
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };
          const profilePictureFile = files?.profilePicture?.[0];
          const coverPictureFile = files?.coverPicture?.[0];
      
          // Upload to Cloudinary if files exist
          const uploadImage = async (file: Express.Multer.File, folder: string) => {
            if (!file || !file.path) {
              throw new Error('File not found. Please upload a valid image.');
            }
          
            return await cloudinary.uploader.upload(file.path, { folder });
          };

          if (!files?.profilePicture) {
            console.error('Profile picture file not found in the request.');
          }
          
      
          const coverPictureUrl = coverPictureFile
          ? await uploadImage(coverPictureFile, 'cover-pictures')
          : null;
        
        // Use only the URL
        const coverPicture = coverPictureUrl ? coverPictureUrl.secure_url : null;
        
        const profilePictureUrl = profilePictureFile
          ? await uploadImage(profilePictureFile, 'profile-pictures')
          : null;
        
        const profilePicture = profilePictureUrl ? profilePictureUrl.secure_url : null;
        
        // Update user's profile
        const updatedProfile = await Users.findByIdAndUpdate(
          userId,
          {
            $set: {
              'profile.isComplete': true,
              'profile.firstName': firstName,
              'profile.lastName': lastName,
              'profile.bio': bio,
              'profile.gender': gender,
              'profile.dateOfBirth': dateOfBirth,
              'profile.profilePicture': profilePicture, // Save the URL string
              'profile.coverPicture': coverPicture, // Save the URL string
            },
          },
          { new: true }
        );
          if (!updatedProfile) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          res.status(200).json({
            message: 'Profile updated successfully',
            profile: updatedProfile.profile,
          });
        } catch (error) {
          console.error('Error completing profile:', error);
          res.status(500).json({ message: 'Server error' });
        }
      },
      

    
    // Update profile
    updateProfile : async (req: Request, res: Response): Promise<any> => {


        try{

        } catch{

        }

    },

    
}