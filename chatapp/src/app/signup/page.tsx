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
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();

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

  // State and effect to manage OTP verification persistence
  const [registrationEmail, setRegistrationEmail] = useState<string | null>(null);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);

  // Check for persistent registration state on component mount
  useEffect(() => {
    const persistedRegistrationData = localStorage.getItem('registrationData');
    
    if (persistedRegistrationData) {
      const { email, isAwaitingVerification } = JSON.parse(persistedRegistrationData);
      
      if (isAwaitingVerification) {
        setRegistrationEmail(email);
        setIsOTPModalOpen(true);
      }
    }
  }, []);

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

  // Registration Submission Handler
  const onSubmit = async () => {
    const data = getValues();
    try {
      // Clear saved form data on successful submission
      sessionStorage.removeItem('registrationFormData');

      // Register user
      await registerUser(data.username, data.email, data.password);

      // Persist registration data
      localStorage.setItem('registrationData', JSON.stringify({
        email: data.email,
        isAwaitingVerification: true
      }));

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

      // Clear persistent registration data
      localStorage.removeItem('registrationData');

      // Redirect to login
      router.push('/completeprofile/personalinfo');

    } catch (error) {
      console.error('Verification failed:', error);
      throw error;
    }
  }, [verify, router]);

  // Cancel Verification Handler
  const handleCancelVerification = useCallback(async () => {
    if (registrationEmail) {
      try {
        await cancelVerification(registrationEmail);

        // Clear persistent registration data
        localStorage.removeItem('registrationData');

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
            <label htmlFor="username" className={`${errors.username ? 'text-red-500' : 'text-black dark:text-white'} block mb-1`}
            >
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


          {errors.username && (
            <p className="text-red-500 text-sm mt-1"> X {errors.username.message}</p>
          )}


          {/* Email field */}
          <div>
            <label htmlFor="email" className={`${errors.email ? 'text-red-500' : 'text-black dark:text-white'} block mb-1`}
            >
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

          {errors.email && (
            <p className="text-red-500 text-sm mt-1"> X {errors.email.message}</p>
          )}


          {/* Password field */}
          <div className="relative">
            <label htmlFor="password" className={`${errors.password ? 'text-red-500' : 'text-black dark:text-white'} block mb-1`}
            >
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

          {errors.password && (
            <p className="text-red-500 text-sm mt-1"> X {errors.password.message}</p>
          )}

          {/* Confirm Password Field */}
          <div className="relative">
            <label htmlFor="confirmPassword" className={`${errors.confirmPassword ? 'text-red-500' : 'text-black dark:text-white'} block mb-1`}
            >
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

          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1"> X {errors.confirmPassword.message}</p>
          )}
          <div>


          </div>
          {/* Register button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white bg-black border-black border dark:bg-white dark:text-black rounded-md p-3 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed "
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>

        </form>


        {authError && (
          <p className="text-red-500 text-sm mt-1">{authError}</p>
        )}

        {/* Login link */}
        <div className="mt-2 text-center text-black dark:text-white">
          <p className='text-s'>Already have an account?{' '}  <Link href="/login" className="underline">
            Login
          </Link></p>

        </div>
         {/* OTP Modal */}
         {isOTPModalOpen && registrationEmail && (
          <OTPModal
            isOpen={true}
            onClose={() => {}}  // Prevent closing
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