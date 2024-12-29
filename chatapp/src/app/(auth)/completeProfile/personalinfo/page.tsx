"use client"
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';import { ProfileContext } from '@/app/contexts/CompleteProfileContext'; 
import { ProfilePayload } from '@/app/validators/profileValidation';



export default function PersonalInfoPage() {
    const router = useRouter();
    const profileContext = useContext(ProfileContext);

    const { register, handleSubmit, formState: { errors } } = useForm<ProfilePayload>({
        defaultValues: {
            firstName: profileContext?.profileData.firstName || '',
            lastName: profileContext?.profileData.lastName || '',
            gender: profileContext?.profileData.gender || 'other',
            dateOfBirth: profileContext?.profileData.dateOfBirth
                ? new Date(profileContext.profileData.dateOfBirth)
                : undefined,
        }
    });

    const onSubmit = (data: ProfilePayload) => {
        profileContext?.updateProfileData(data);
        router.push('/completeprofile/customization');
    };

    useEffect(() => {
        if (profileContext) {
            console.log('Profile data in PersonalInfoPage:', profileContext.profileData);
        }
    }, [profileContext]);


    return (
        <div className="max-w-md mx-auto  ">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Tell us more about yourself
            </h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {/* Names */}
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            First Name
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            placeholder="Enter your first name"
                            {...register('firstName', { required: true, minLength: 3, maxLength: 30 })}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} dark:border-gray-600 
        focus:ring-2 focus:ring-black focus:outline-none focus:border-transparent dark:bg-gray-700
        text-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-400`}
                        />

                        {errors.firstName && <span className="text-red-500">First name is required</span>}
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Last Name
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            placeholder="Enter your last name"
                            {...register('lastName', { required: true, minLength: 3, maxLength: 30 })}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} dark:border-gray-600 
                                focus:ring-2 focus:ring-black  focus:outline-none focus:border-transparent dark:bg-gray-700
                               text-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-400`}
                        />
                        {errors.lastName && <span className="text-red-500">Last name is required</span>}
                    </div>

                    {/* Gender */}
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Gender
                        </label>
                        <select
                            id="gender"
                            {...register('gender', { required: true })}
                            className="w-full px-4 py-3 rounded-lg border  border-gray-300 dark:border-gray-600 
                                focus:ring-2 focus:ring-black focus:border-transparent dark:bg-gray-700 bg-white
                              text-gray-600  dark:text-white placeholder-white::placeholder dark:placeholder-gray-400"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    {/* Date of Birth */}
                    <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date of Birth
                        </label>
                        <input
                            id="dateOfBirth"
                            type="date"
                            {...register('dateOfBirth', { required: true })}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} dark:border-gray-600 
                                focus:ring-2 focus:ring-black focus:border-transparent  focus:outline-none dark:bg-gray-700
                            text-gray-600    dark:text-white placeholder-gray-800 dark:placeholder-gray-400`}
                        />
                        {errors.dateOfBirth && <span className="text-red-500">Date of birth is required</span>}
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full text-white bg-black border-black border dark:bg-white dark:text-black rounded-md p-3 font-medium hover:bg-gray-100 transition-colors"
                >
                    Continue
                </button>
            </form>
        </div>
    );
}