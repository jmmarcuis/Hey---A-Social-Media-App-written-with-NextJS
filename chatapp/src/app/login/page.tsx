"use client"
import Link from 'next/link';
import ThemeToggle from '@/app/components/icons/ThemeToggle';
import { Icon } from '@iconify/react';
import { useCallback, useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginPayload } from "@/app/validators/authValidation";
import OTPModal from '../components/modals/otpModal';
import { useRouter } from 'next/navigation';

export default function Login() {
  // State management
  const [showPassword, setShowPassword] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  const { login, error, verify, cancelVerification } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginPayload) => {
    try {
      const user = await login(data.email, data.password);
      // Store email for OTP verification
      setUserEmail(data.email);
      
      // If user is not verified, show OTP modal
      if (user && !user.verification.isVerified) {
        setIsOTPModalOpen(true);
      }
      // If user is verified, login function will handle the redirect
    } catch (loginError) {
      console.error("Login failed", loginError);
    }
  };

  // Handle OTP verification
  const handleVerification = useCallback(async (email: string, otp: string) => {
    try {
      await verify(email, otp);
      setIsOTPModalOpen(false);
      router.push('/completeprofile');

    } catch (error) {
      console.error("Verification failed", error);
      throw error; // Let the OTP modal handle the error display
    }
  }, [verify, router]);

  // Handle cancellation of verification
  const handleCancelVerification = async () => {
    try {
      await cancelVerification(userEmail);
      setIsOTPModalOpen(false);
    } catch (error) {
      console.error("Cancellation failed", error);
      throw error;
    }
  };

  return (
    <div className="h-screen flex items-center flex-col justify-center bg-white dark:bg-black">
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="w-full max-w-md border-customGray border-2 rounded-lg p-8">
          <h1 className="text-2xl font-semibold text-black dark:text-white mb-2">Login</h1>
          <p className="text-black dark:text-white mb-2">
            Enter your email below to login to your account
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className={`${errors.email ? 'text-red-500' : 'text-black dark:text-white'} block mb-1`}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${errors.email ? 'border-red-500' : 'border-customGray'}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="relative">
              <div className="flex justify-between mb-2">
                <label htmlFor="password" 
                  className={`${errors.password ? 'text-red-500' : 'text-black dark:text-white'} block mb-1`}
                >
                  Password
                </label>
                <Link href="/forgot-password" className="text-black dark:text-white underline">
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  {...register("password")}
                  className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${errors.password ? 'border-red-500' : 'border-customGray'}`}
                />
                <Icon
                  onClick={togglePassword}
                  icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                  width="20"
                  height="20"
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white cursor-pointer'
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>

            {/* Login buttons */}
            <button
              type="submit"
              className="w-full text-white bg-black border-black border dark:bg-white dark:text-black rounded-md p-3 font-medium hover:bg-gray-100 transition-colors"
            >
              Login
            </button>
            <button
              type="button"
              className="w-full border text-black border-customGray dark:text-white rounded-md p-3 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="ph:google-logo-bold" className="w-5 h-5" />
              <span>Login with Google</span>
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center text-black dark:text-white">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <ThemeToggle />

      {/* OTP Modal */}
      {isOTPModalOpen && userEmail && (
      <OTPModal
        isOpen={true}
        onClose={() => {}}  // Prevent closing
        onVerify={handleVerification}
        onCancel={handleCancelVerification}
        email={userEmail}
      />
      )
      }
    </div>
  );
}