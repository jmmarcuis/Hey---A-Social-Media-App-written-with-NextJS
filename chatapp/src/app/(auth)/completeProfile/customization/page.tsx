// "use client";
// import { useContext } from 'react';
// import { useRouter } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { ProfileContext } from '@/app/contexts/CompleteProfileContext';
// import { CustomizationPayload, customizationSchema } from '@/app/validators/profileValidation';


// export default function CustomizeProfilePage() {
//     const router = useRouter();
//     const profileContext = useContext(ProfileContext);


//     // Update current input to the context session storage
//     const { register, handleSubmit, formState: { errors } } = useForm<CustomizationPayload>({
//         resolver: zodResolver(customizationSchema),

//         defaultValues: {
//             profilePicture: profileContext?.profileData.profilePicture || '',
//             coverPicture: profileContext?.profileData.coverPicture || '',
//             bio: profileContext?.profileData.bio || '',
//         }
//     });

//     // Handle form submission
//     const onSubmit = (data: CustomizationPayload) => {
//         if (Object.keys(errors).length > 0) {
//             return;
//         }
//         try {
//             // ! TODO INSERT CLOUDINARY LOGIC HERE
//             // ! WOULD BE BETTER IF I DO THIS USING A HOOK!


//             // Navigate to next page
//             profileContext?.updateProfileData(data);
//             router.push('/completeprofile/confirmdetails');
//         } catch (error) {
//             // Handle upload errors
//             console.error('Profile picture upload failed', error);
//             // Optional: Show error message to user
//         }
//     };

//     // Go back function
//     const goBack = () => {
//         router.push('/completeprofile/personalinfo');
//     };

//     return (
//         <div className="max-w-md mx-auto  ">


//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 {/* Profile Picture Upload */}
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Profile Picture
//                     </label>
//                     <input
//                         type="file"

//                         accept="image/*"
//                         className="hidden"
//                         id="profilePicture"
//                     />
//                     <label
//                         htmlFor="profilePicture"
//                         className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
//                     >
//                         {profileContext?.profileData.profilePicture ? (
//                             <img
//                                 src={profileContext.profileData.profilePicture}
//                                 alt="Profile"
//                                 className="w-full h-full object-cover rounded-full"
//                             />
//                         ) : (
//                             <span className="text-gray-500 dark:text-gray-400">
//                                 Upload
//                             </span>
//                         )}
//                     </label>
//                 </div>

//                 {/* Cover Picture Upload */}
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Cover Picture
//                     </label>
//                     <input
//                         type="file"

//                         accept="image/*"
//                         className="hidden"
//                         id="coverPicture"
//                     />
//                     <label
//                         htmlFor="coverPicture"
//                         className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
//                     >
//                         {profileContext?.profileData.coverPicture ? (
//                             <img
//                                 src={profileContext.profileData.coverPicture}
//                                 alt="Cover"
//                                 className="w-full h-full object-cover"
//                             />
//                         ) : (
//                             <span className="text-gray-500 dark:text-gray-400">
//                                 Upload Cover Picture
//                             </span>
//                         )}
//                     </label>
//                 </div>

//                 {/* Bio Input */}
//                 <div>
//                     <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Bio
//                     </label>
//                     <textarea
//                         id="bio"
//                         {...register('bio')}
//                         value={profileContext?.profileData.bio || ''}
//                         onChange={(e) => profileContext?.updateProfileData({ bio: e.target.value })}
//                         placeholder="Tell us about yourself..."
//                         className="w-full p-2 border rounded-md text-black focus:ring-black  border-black   focus:outline-none focus:border-transparent "
//                         rows={4}
//                     />
//                 </div>

//                 {/* Error Display */}
//                 {Object.keys(errors).length > 0 && (
//                     <div className="text-red-500 text-sm p-2 bg-red-100 rounded">
//                         {Object.values(errors).map((error, index) => (
//                             <div key={index}>{error.message}</div>
//                         ))}
//                     </div>
//                 )}


//                 {/* Navigation Buttons */}
//                 <div className="flex space-x-4">
//                     <button
//                         type="button"
//                         onClick={goBack}
//                         className="w-full text-black bg-white border border-black dark:bg-gray-800 dark:text-white rounded-md p-3 font-medium hover:bg-gray-100 transition-colors"
//                     >
//                         Go Back
//                     </button>
//                     <button
//                         type="submit"
//                         className="w-full text-white bg-black border-black border dark:bg-white dark:text-black rounded-md p-3 font-medium hover:bg-gray-100 transition-colors"
//                     >
//                         Continue
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// }