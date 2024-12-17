"use client";
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileContext } from '@/app/contexts/completeProfileContext';// Adjust import path as needed

export default function CustomizeProfilePage() {
    const router = useRouter();
    const profileContext = useContext(ProfileContext);
    
    // State for image files to upload
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

    // Handle file selection for upload
    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>, 
        type: 'profile' | 'cover'
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            // For this example, we'll create a preview and store the file
            const fileUrl = URL.createObjectURL(file);
            
            if (type === 'profile') {
                setProfileImageFile(file);
                profileContext?.updateProfileData({ 
                    profilePicture: fileUrl // Temporary preview URL
                });
            } else {
                setCoverImageFile(file);
                profileContext?.updateProfileData({ 
                    coverPicture: fileUrl // Temporary preview URL
                });
            }
        }
    };

    // Cloudinary upload function (you'll need to implement the actual upload logic)
    const uploadToCloudinary = async (file: File): Promise<string> => {
        // Create a FormData object
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'YOUR_CLOUDINARY_UPLOAD_PRESET'); // Replace with your preset

        try {
            // Make POST request to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, 
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.secure_url; // Cloudinary returns the URL of the uploaded image
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    };

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        try {
            // Upload profile picture if a file is selected
            if (profileImageFile) {
                const profilePictureUrl = await uploadToCloudinary(profileImageFile);
                profileContext?.updateProfileData({ 
                    profilePicture: profilePictureUrl 
                });
            }

            // Upload cover picture if a file is selected
            if (coverImageFile) {
                const coverPictureUrl = await uploadToCloudinary(coverImageFile);
                profileContext?.updateProfileData({ 
                    coverPicture: coverPictureUrl 
                });
            }

            // Navigate to next page
            router.push('/completeProfile/confirmProfile');
        } catch (error) {
            // Handle upload errors
            console.error('Profile picture upload failed', error);
            // Optional: Show error message to user
        }
    };

    // Go back function
    const goBack = () => {
        router.push('/completeProfile/personalinfo');
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Customize Your Profile
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Picture Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Profile Picture
                    </label>
                    <input 
                        type="file" 
                        onChange={(e) => handleFileChange(e, 'profile')}
                        accept="image/*"
                        className="hidden"
                        id="profilePicture"
                    />
                    <label 
                        htmlFor="profilePicture"
                        className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        {profileContext?.profileData.profilePicture ? (
                            <img 
                                src={profileContext.profileData.profilePicture} 
                                alt="Profile" 
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                                Upload
                            </span>
                        )}
                    </label>
                </div>

                {/* Cover Picture Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cover Picture
                    </label>
                    <input 
                        type="file" 
                        onChange={(e) => handleFileChange(e, 'cover')}
                        accept="image/*"
                        className="hidden"
                        id="coverPicture"
                    />
                    <label 
                        htmlFor="coverPicture"
                        className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        {profileContext?.profileData.coverPicture ? (
                            <img 
                                src={profileContext.profileData.coverPicture} 
                                alt="Cover" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                                Upload Cover Picture
                            </span>
                        )}
                    </label>
                </div>

                {/* Bio Input */}
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                    </label>
                    <textarea 
                        id="bio"
                        value={profileContext?.profileData.bio || ''}
                        onChange={(e) => profileContext?.updateProfileData({ bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        rows={4}
                    />
                </div>

                {/* Navigation Buttons */}
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={goBack}
                        className="w-full text-black bg-white border border-black dark:bg-gray-800 dark:text-white rounded-md p-3 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        type="submit"
                        className="w-full text-white bg-black border-black border dark:bg-white dark:text-black rounded-md p-3 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </form>
        </div>
    );
}