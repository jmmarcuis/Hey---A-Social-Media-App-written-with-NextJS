"use client"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfilePayload, profileSchema } from '@/app/validators/profileValidation';
import { useCompleteProfile } from '@/app/hooks/useCompleteProfile';
import { useRouter } from 'next/navigation';
export default function CompleteProfile() {
  const router = useRouter();

    const { completeProfile, loading: isLoading } = useCompleteProfile();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfilePayload>({
        resolver: zodResolver(profileSchema),

    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'profilePicture' | 'coverPicture') => {
        const file = event.target.files?.[0];
        if (file) {
            // Update the form value with the file
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue(fieldName, file as any);

            // Show preview if needed
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById(`${fieldName}Preview`) as HTMLImageElement;
                if (preview && e.target?.result) {
                    preview.src = e.target.result as string;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: ProfilePayload) => {
        console.log("Form submitted with data:", data); try {
            console.log('Form errors:', errors);
            // Create FormData object
            const formData = new FormData();
            formData.append('firstName', data.firstName);
            formData.append('lastName', data.lastName);
            formData.append('bio', data.bio);
            formData.append('gender', data.gender);
            if (data.dateOfBirth) {
                formData.append('dateOfBirth', new Date(data.dateOfBirth).toISOString());
            }

            // Append files if they exist
            const profilePictureInput = document.getElementById('profilePicture') as HTMLInputElement;
            const coverPictureInput = document.getElementById('coverPicture') as HTMLInputElement;

            if (profilePictureInput?.files?.[0]) {
                formData.append('profilePicture', profilePictureInput.files[0]);
            }
            if (coverPictureInput?.files?.[0]) {
                formData.append('coverPicture', coverPictureInput.files[0]);
            }

            // Call the completeProfile function from the hook
                completeProfile(data);
            router.push('/home');


        } catch (completeProfileError) {
            console.error("Login failed", completeProfileError);

        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 border-2 border-black p-12">            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Let&apos;s Finish Your Account
        </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
                Complete your profile to get started.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8  p-12">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Profile Picture */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                Profile Picture
                            </label>
                            <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden relative">
                                <input
                                    type="file"
                                    id="profilePicture"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'profilePicture')}
                                />
                                <img
                                    id="profilePicturePreview"
                                    alt="Profile preview"
                                    className="w-full h-full object-cover hidden"
                                />
                                <label
                                    htmlFor="profilePicture"
                                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                >
                                    <span className="text-gray-400">Upload</span>
                                </label>
                            </div>
                        </div>

                        {/* Cover Picture */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                                Cover Picture
                            </label>
                            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden relative">
                                <input
                                    type="file"
                                    id="coverPicture"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'coverPicture')}
                                />
                                <img
                                    id="coverPicturePreview"
                                    alt="Cover preview"
                                    className="w-full h-full object-cover hidden"
                                />
                                <label
                                    htmlFor="coverPicture"
                                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                >
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
                                {...register('dateOfBirth', {
                                    setValueAs: value => (value ? new Date(value) : undefined),
                                })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-gray-700"
                                placeholder="mm/dd/yyyy"
                            />
                        </div>

                        {/* Error Display */}
                        {Object.keys(errors).length > 0 && (
                            <div className="p-4 bg-red-50 rounded-lg">
                                <p className="text-red-600 text-sm">Please fix the errors below:</p>
                                <ul className="list-disc pl-5 text-red-600 text-sm">
                                    {Object.entries(errors).map(([field, error]) => (
                                        <li key={field}>{(error.message as string) || `Error in ${field}`}</li>
                                    ))}
                                </ul>
                            </div>
                        )}


                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:bg-gray-400"
                >
                    {isLoading ? 'Updating...' : 'Continue'}
                </button>
            </form>
        </div>
    );
}