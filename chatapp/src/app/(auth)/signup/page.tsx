"use client"
import Link from 'next/link';
import ThemeToggle from '@/app/components/icons/ThemeToggle';
import { Icon } from '@iconify/react';
import { useAuth } from '@/app/hooks/useAuth';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterPayload } from '@/app/validators/authValidation';

export default function Signup() {
  // Show Password Function
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

  // Registration Function
  const { register: registerUser, error: authError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur' // Validate on blur to catch errors more dynamically
  });

  // Submit Registration Form
  const onSubmit = async (data: RegisterPayload) => {
    try {
      await registerUser(data.username, data.email, data.password);
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    <div className="h-screen flex items-center flex-col justify-center bg-white dark:bg-black">
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="w-full max-w-md border-customGray border-2 rounded-lg p-8">
          <h1 className="text-2xl font-semibold text-black dark:text-white mb-2">Register</h1>
          <p className="text-gray-400 mb-2">
            Let&apos;s get you started!
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-black dark:text-white mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                {...register("username")}
                className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${
                  errors.username ? 'border-red-500' : 'border-customGray'
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-black dark:text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${
                  errors.email ? 'border-red-500' : 'border-customGray'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="relative">
              <label htmlFor="password" className="block text-black dark:text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.password ? "text" : "password"}
                  id="password"
                  {...register("password")}
                  className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${
                    errors.password ? 'border-red-500' : 'border-customGray'
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
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
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
                  className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${
                    errors.confirmPassword ? 'border-red-500' : 'border-customGray'
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
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {authError && (
              <p className="text-red-500 text-sm mt-1">{authError}</p>
            )}

            {/* Register button */}
            <button
              type="submit"
              className="w-full text-white bg-black border-black border dark:bg-white dark:text-black rounded-md p-3 font-medium hover:bg-gray-100 transition-colors"
            >
              Register
            </button>

            <button
              type="button"
              className="w-full border text-black border-customGray dark:text-white rounded-md p-3 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="ph:google-logo-bold" className="w-5 h-5" />
              <span>Register with Google</span>
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-black dark:text-white">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}