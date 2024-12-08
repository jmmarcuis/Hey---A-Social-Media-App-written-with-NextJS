// src/hooks/useAuth.ts
"use client"
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { loginSchema, registerSchema, otpVerificationSchema } from '../validators/authValidation';
import { AuthUser, AuthResponse, LoginPayload, RegisterPayload, OtpVerificationPayload, User } from '../types/Users';
import { z } from 'zod';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Register Hook
    const register = async (username: string, email: string, password: string) => {
        try {
            setError(null);
            const registerData: RegisterPayload = {
                username,
                email,
                password,
                confirmPassword: password
            };

            // Zod automatically validates the types and values
            registerSchema.parse(registerData);

            const response = await axios.post<AuthResponse>(
                'http://localhost:4000/auth/register',
                registerData
            );

            const { message, token, user: responseUser } = response.data;

            const authUser: AuthUser = {
                id: responseUser.id,
                email: responseUser.email,
                username: responseUser.username,
                token,
                verification: responseUser.verification
            };

            console.log(message);
            setUser(authUser);

            return authUser;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors[0].message;
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Registration failed';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            throw error;
        }
    };


    // Verify Email Hook
    const verify = async (email: string, otp: string): Promise<User> => {
        try {
            console.log('Verifying OTP:', { email, otp });
            setError(null);
            const verificationData: OtpVerificationPayload = { email, otp };
            otpVerificationSchema.parse(verificationData);

            const response = await axios.post<AuthResponse>(
                'http://localhost:4000/auth/verify',
                verificationData
            );

            console.log('Verification response:', response.data);

            const { user: responseUser } = response.data;

            if (!responseUser) {
                throw new Error('No user data received');
            }

            const authUser: AuthUser = {
                id: responseUser.id,
                email: responseUser.email,
                username: responseUser.username,
                token: '', // No token at this stage
                verification: {
                    isVerified: true,
                    otp: undefined
                }
            };

            setUser(authUser);
            router.push('/completeProfile')

            return responseUser;
        } catch (error) {
            console.error('Full verification error:', error);

            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Verification failed';
                console.error('Axios error message:', errorMessage);
                setError(errorMessage);
                throw new Error(errorMessage);
            } else if (error instanceof z.ZodError) {
                const errorMessage = error.errors[0].message;
                console.error('Zod validation error:', errorMessage);
                setError(errorMessage);
                throw new Error(errorMessage);
            } else {
                console.error('Unexpected error:', error);
                setError('An unexpected error occurred');
                throw error;
            }
        }
    };
    const resendOTP = async (email: string): Promise<{ success: boolean; message: string }> => {
        try {
            setError(null);
            const response = await axios.post<AuthResponse>(
                'http://localhost:4000/auth/resend-otp',
                { email }
            );

            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
                setError(errorMessage);
            } else {
                setError('An unexpected error occurred');
            }
            throw error;
        }
    };

    const cancelVerification = async (email: string): Promise<{ success: boolean; message: string }> => {
        try {
            setError(null);
            const response = await axios.post<AuthResponse>(
                'http://localhost:4000/auth/verify/cancel',
                { email }
            );

            setUser(null);
            localStorage.removeItem('token');

            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Failed to cancel verification';
                setError(errorMessage);
            } else {
                setError('An unexpected error occurred');
            }
            throw error;
        }
    };


    // Login Hook
    const login = async (email: string, password: string) => {
        try {
            setError(null);
            const loginData: LoginPayload = { email, password };

            // Zod automatically validates the types and values
            loginSchema.parse(loginData);

            const response = await axios.post<AuthResponse>(
                'http://localhost:4000/auth/login',
                loginData
            );

            const { message, token, user: responseUser } = response.data;

            const authUser: AuthUser = {
                id: responseUser.id,
                email: responseUser.email,
                username: responseUser.username,
                token,
                verification: responseUser.verification
            };

            localStorage.setItem('token', token);
            setUser(authUser);

            console.log(message);

            router.push('/home');

            return authUser;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors[0].message;
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Login failed';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return {
        user,
        register,
        verify,
        resendOTP,
        cancelVerification,
        login,
        logout,
        error
    };
}