"use client"
import Link from 'next/link';
import ThemeToggle from '@/app/components/icons/ThemeToggle';
import { Icon } from '@iconify/react';
import { useAuth } from '@/app/hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterPayload } from '@/app/validators/authValidation';
import OTPModal from '@/app/components/modals/otpModal';

export default function Signup() {
  // State for password visibility
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  // Toggle password visibility
  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Call in all methods in the useAuth hook   
  const { register: registerUser, verify, cancelVerification, error: authError } = useAuth();

  // Registration Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,

  } = useForm<RegisterPayload>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  // Persistent form data in sessionStorage
  useEffect(() => {
    const savedFormData = sessionStorage.getItem('registrationFormData');
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      reset(parsedData);
    }
  }, [reset]);

  // Track form changes and save to sessionStorage
  const handleFormChange = () => {
    const currentValues = getValues();
    sessionStorage.setItem('registrationFormData', JSON.stringify(currentValues));
  };

  // OTP Modal State
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState<string | null>(null);

  // Registration Submission Handler
  const onSubmit = async () => {
    const data = getValues();
    try {
      // Clear saved form data on successful submission
      sessionStorage.removeItem('registrationFormData');

      // Register user
       await registerUser(data.username, data.email, data.password);
      
      // Set email for OTP verification
      setRegistrationEmail(data.email);
      
      // Open OTP Modal
      setIsOTPModalOpen(true);
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  // Verification Handler
  const handleVerification = useCallback(async (email: string, otp: string) => {
    try {
      await verify(email, otp);
      
      // Close OTP Modal on successful verification
      setIsOTPModalOpen(false);
      
    } catch (error) {
      console.error('Verification failed:', error);
      throw error;
    }
  }, [verify]);

  // Cancel Verification Handler
  const handleCancelVerification = useCallback(async () => {
    if (registrationEmail) {
      try {
        await cancelVerification(registrationEmail);
        
        // Close OTP Modal
        setIsOTPModalOpen(false);
        
        // Reset email
        setRegistrationEmail(null);
      } catch (error) {
        console.error('Cancellation failed:', error);
      }
    }
  }, [cancelVerification, registrationEmail]);

  return (

    <div className=" min-h-screen flex items-center justify-center p-8 bg-white dark:bg-black">
      <div className="w-full max-w-md border-customGray border-2 rounded-lg p-6">
        <h1 className="text-xl font-semibold text-black dark:text-white mb-1">Register</h1>
        <p className=" text- text-gray-400 mb-2">
          Let&apos;s get you started!
        </p>

        <form onSubmit={handleSubmit(onSubmit)} onChange={handleFormChange} className="space-y-1">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-black dark:text-white mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              {...register("username")}
              className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${errors.username ? 'border-red-500' : 'border-customGray'
                }`}
            />

          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-black dark:text-white mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${errors.email ? 'border-red-500' : 'border-customGray'
                }`}
            />
          </div>

          {/* Password field */}
          <div className="relative">
            <label htmlFor="password" className="block text-black dark:text-white mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword.password ? "text" : "password"}
                id="password"
                {...register("password")}
                className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${errors.password ? 'border-red-500' : 'border-customGray'
                  }`}
              />
              <Icon
                onClick={() => togglePasswordVisibility('password')}
                icon={showPassword.password ? "mdi:eye-off" : "mdi:eye"}
                width="20"
                height="20"
                className='absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white cursor-pointer'
              />
            </div>

          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-black dark:text-white mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword.confirmPassword ? "text" : "password"}
                id="confirmPassword"
                {...register("confirmPassword")}
                className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${errors.confirmPassword ? 'border-red-500' : 'border-customGray'
                  }`}
              />
              <Icon
                onClick={() => togglePasswordVisibility('confirmPassword')}
                icon={showPassword.confirmPassword ? "mdi:eye-off" : "mdi:eye"}
                width="20"
                height="20"
                className='absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white cursor-pointer'
              />
            </div>

          </div>

          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}

          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
          )}
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}

          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}

          {authError && (
            <p className="text-red-500 text-sm mt-1">{authError}</p>
          )}

          {/* Register button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white bg-black border-black border dark:bg-white dark:text-black rounded-md p-3 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>

        </form>

        {/* Login link */}
        <div className="mt-2 text-center text-black dark:text-white">
          <p className='text-s'>Already have an account?{' '}  <Link href="/login" className="underline">
            Login
          </Link></p>

        </div>
        {/* // Update the OTPModal rendering */}
        {isOTPModalOpen && registrationEmail && (
          <OTPModal
            isOpen={isOTPModalOpen}
            onClose={() => setIsOTPModalOpen(false)}
            onVerify={handleVerification}
            onCancel={handleCancelVerification}
            email={registrationEmail}
          />
        )}
        <ThemeToggle />

      </div>
    </div>

  );
}