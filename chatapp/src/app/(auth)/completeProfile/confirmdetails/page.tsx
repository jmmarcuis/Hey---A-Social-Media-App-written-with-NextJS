"use client";
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileContext } from '@/app/contexts/CompleteProfileContext';
import { useCompleteProfile } from '@/app/hooks/useCompleteProfile';
import { format } from 'date-fns';



export default function ConfirmDetailsPage() {
    const router = useRouter();
    const profileContext = useContext(ProfileContext);
    const { completeProfile, loading, error } = useCompleteProfile();

    if (!profileContext) {
        return <div>Loading...</div>;
    }

    const { profileData } = profileContext;

    const handleSubmit = async () => {
        const response = await completeProfile(profileData);
        if (response.success) {
            localStorage.removeItem('profileData');
            router.push('/home'); // Or wherever you want to redirect after success
        }
    };

    const goBack = () => {
        router.push('/completeprofile/customization');
    };

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'Not provided';
        return format(new Date(date), 'MMMM dd, yyyy');  
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Confirm Your Details
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                {/* Personal Information */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">First Name</p>
                            <p className="text-gray-900 dark:text-white">{profileData.firstName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last Name</p>
                            <p className="text-gray-900 dark:text-white">{profileData.lastName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                            <p className="text-gray-900 dark:text-white capitalize">{profileData.gender}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                            <p suppressHydrationWarning className="text-gray-900 dark:text-white">
                                {profileData.dateOfBirth ? formatDate(profileData.dateOfBirth) : 'Not provided'}
                            </p>

                        </div>
                    </div>
                </div>

                {/* Profile Pictures */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Profile Pictures
                    </h3>
                    <div className="space-y-4">
                        {profileData.profilePicture && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Profile Picture</p>
                                <img
                                    src={profileData.profilePicture}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover"
                                />
                            </div>
                        )}
                        {profileData.coverPicture && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Cover Picture</p>
                                <img
                                    src={profileData.coverPicture}
                                    alt="Cover"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bio</h3>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {profileData.bio || 'No bio provided'}
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="text-red-500 text-sm p-2 bg-red-100 rounded">
                        {error}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={goBack}
                        className="w-full text-black bg-white border border-black dark:bg-gray-800 dark:text-white rounded-md p-3 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full text-white bg-black border-black border dark:bg-white dark:text-black rounded-md p-3 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Confirm & Complete'}
                    </button>
                </div>
            </div>
        </div>
    );
}