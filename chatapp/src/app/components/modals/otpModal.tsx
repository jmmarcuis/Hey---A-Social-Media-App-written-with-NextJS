"use client"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpVerificationSchema, OtpVerificationPayload } from '@/app/validators/authValidation';
import { useRef, KeyboardEvent, useEffect, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

interface OTPModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (email: string, otp: string) => Promise<void>;
    email: string;
    onCancel?: () => Promise<void>;
}

export default function OTPModal({
    isOpen,
    // onClose,
    onVerify,
    email,
    onCancel
}: OTPModalProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendError, setResendError] = useState<string | null>(null);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    const {
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<OtpVerificationPayload>({
        resolver: zodResolver(otpVerificationSchema),
        defaultValues: {
            email: email,
            otp: ''
        }
    });

    // Import resendOTP from useAuth hook
    const { resendOTP } = useAuth();

    // Reset form and errors when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            setResendError(null);
            setVerificationError(null);
        }
    }, [isOpen, reset]);

    // Cooldown timer for resend
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleInputChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const currentOtp = watch('otp') || '';
        const otpArray = currentOtp.split('');
        otpArray[index] = value;
        const newOtp = otpArray.join('');

        setValue('otp', newOtp, { shouldValidate: true });

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            const currentOtp = watch('otp') || '';
            const otpArray = currentOtp.split('');

            if (!otpArray[index] && index > 0) {
                otpArray[index - 1] = '';
                setValue('otp', otpArray.join(''), { shouldValidate: true });
                inputRefs.current[index - 1]?.focus();
            } else {
                otpArray[index] = '';
                setValue('otp', otpArray.join(''), { shouldValidate: true });
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const numbersOnly = pastedData.replace(/\D/g, '').slice(0, 6);

        if (numbersOnly.length > 0) {
            setValue('otp', numbersOnly, { shouldValidate: true });
            const focusIndex = Math.min(numbersOnly.length - 1, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const onSubmit = async (data: OtpVerificationPayload) => {
        try {
            setVerificationError(null);
            await onVerify(email, data.otp);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'OTP verification failed. Please try again.';

            setVerificationError(errorMessage);
        }
    };

    if (!isOpen) return null;

    // Resend OTP Handler
    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;

        // Optimistically set the cooldown before making the API call
        setResendCooldown(60); // 60 seconds cooldown

        try {
            setResendError(null);
            await resendOTP(email);
        } catch (error) {
            // If there's an error, reset cooldown to 0 for retry
            setResendCooldown(0);

            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to resend OTP. Please try again.';
            setResendError(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-white p-8 rounded-lg max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-4 text-center text-black">
                    Verify Your Email
                </h2>
                <p className="text-black mb-6 text-center">
                    We&apos;ve sent a verification code to <br />
                    <span className="font-medium">{email}</span>
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>

                    <div className="flex gap-2 mb-6 justify-center" onPaste={handlePaste}>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                className={`w-10 h-12 text-center text-xl border rounded-md 
                                focus:outline-none focus:ring-2 focus:ring-black text-black
                                border-gray-700 ${errors.otp ? 'border-red-500' : ''}`}
                                value={watch('otp')?.charAt(index) || ''}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                            />
                        ))}
                    </div>

                    {errors.otp && (
                        <p className="text-red-500 text-sm text-center mb-4">
                            {errors.otp.message}
                        </p>
                    )}

                    {verificationError && (
                        <p className="text-red-500 text-sm text-center mb-4">
                            {verificationError}
                        </p>
                    )}

                    <div className="flex gap-4 mb-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-black text-white py-2 rounded-md hover:opacity-90 
                                     transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Verifying...' : 'Verify'}
                        </button>

                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="flex-1 border border-gray-700 text-black py-2 rounded-md 
                                     hover:bg-black hover:text-white transition-colors 
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>

                    {resendError && (
                        <p className="text-red-500 text-sm text-center mt-2">
                            {resendError}
                        </p>
                    )}
                </form>

                <p className="mt-4 text-sm text-gray-900 text-center">
                    Didn&apos;t receive the code?{' '}
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendCooldown > 0}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 
                                 dark:hover:text-blue-300 font-medium 
                                 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                    </button>
                </p>
                {resendError && (
                    <p className="text-red-500 text-sm text-center mt-2">
                        {resendError}
                    </p>
                )}

            </div>
        </div>
    );
}