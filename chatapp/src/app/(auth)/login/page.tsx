// Login Page
"use client"
import Link from 'next/link';
import ThemeToggle from '@/app/components/icons/ThemeToggle';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginPayload } from "@/app/validators/authValidation";

export default function Login() {
  // Show Password Function
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const { login, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginPayload) => {
    try {
      await login(data.email, data.password);
    } catch (loginError) {
      console.error("Login failed", loginError);
    }
  };

  return (
    <div className="h-screen flex items-center flex-col justify-center bg-white dark:bg-black">
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="w-full max-w-md border-customGray border-2 rounded-lg p-8">
          <h1 className="text-2xl font-semibold text-black dark:text-white mb-2">Login</h1>
          <p className="text-gray-400 mb-2">
            Enter your email below to login to your account
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-black dark:text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${errors.email ? 'border-red-500' : 'border-customGray'
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="relative">
              <div className="flex justify-between mb-2">
                <label htmlFor="password" className="block text-black dark:text-white">
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
                  className={`w-full p-3 dark:bg-black border rounded-md text-black dark:text-white focus:outline-none ${errors.password ? 'border-red-500' : 'border-customGray'
                    }`}
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
              className="w-full border text-black border-customGray dark:text-white rounded-md p-3 font-medium transition-colors"
            >
              Login with Google
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
    </div>
  );
}