"use client"
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileContext } from '@/app/contexts/CompleteProfileContext';
import { ProfilePayload, profileSchema } from '@/app/validators/profileValidation';

export default function PersonalInfoPage() {
    const router = useRouter();
    const profileContext = useContext(ProfileContext);

    const { register, handleSubmit, formState: { errors } } = useForm<ProfilePayload>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: profileContext?.profileData.firstName || '',
            lastName: profileContext?.profileData.lastName || '',
            gender: profileContext?.profileData.gender || 'other',
            dateOfBirth: profileContext?.profileData.dateOfBirth || null,
            profilePicture: profileContext?.profileData.profilePicture || '',
            coverPicture: profileContext?.profileData.coverPicture || '',
            bio: profileContext?.profileData.bio || '',
        }
    });

    const onSubmit = (data: ProfilePayload) => {
        if (Object.keys(errors).length > 0) return;
        profileContext?.updateProfileData(data);
        router.push('/home');
    };

    return (
        <div className="max-w-3xl mx-auto px-4 border-2 border-black">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Lets Finish Your Account
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facilis nisi porro, obcaecati incidunt pariatur soluta dolore unde commodi ipsum, ad adipisci in ut suscipit non beatae! Est quae nesciunt obcaecati.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Profile Picture */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                Profile Picture
                            </label>
                            <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden">
                                <input type="file" className="hidden" id="profilePicture" accept="image/*" />
                                <label htmlFor="profilePicture" className="w-full h-full flex items-center justify-center cursor-pointer">
                                    <span className="text-gray-400">Upload</span>
                                </label>
                            </div>
                        </div>

                        {/* Cover Picture */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                Cover Picture
                            </label>
                            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                <input type="file" className="hidden" id="coverPicture" accept="image/*" />
                                <label htmlFor="coverPicture" className="w-full h-full flex items-center justify-center cursor-pointer">
                                    <span className="text-gray-400">Upload</span>
                                </label>
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                Bio
                            </label>
                            <textarea
                                {...register('bio')}
                                placeholder="Tell us about yourself..."
                                className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-black focus:border-transparent outline-none text-gray-700 placeholder-gray-400"
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                {...register('firstName')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-gray-700 placeholder-gray-400"
                                placeholder="John"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                {...register('lastName')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-gray-700 placeholder-gray-400"
                                placeholder="Marston"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                Gender
                            </label>
                            <select
                                {...register('gender')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-gray-700 bg-white"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                {...register('dateOfBirth')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-gray-700"
                                placeholder="mm/dd/yyyy"
                            />
                        </div>

                        {/* Error Display */}
                        {Object.keys(errors).length > 0 && (
                            <div className="p-4 bg-red-50 rounded-lg">
                                {Object.values(errors).map((error, index) => (
                                    <p key={index} className="text-red-600 text-sm">{error.message}</p>
                                ))}
                            </div>
                        )}

                    </div>
                </div>


                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                >
                    Continue
                </button>
            </form>
        </div>
    );
}