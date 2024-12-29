// src/hooks/useAuth.ts
"use client"
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { loginSchema, registerSchema, otpVerificationSchema, LoginPayload, RegisterPayload, OtpVerificationPayload } from '../validators/authValidation';
import { AuthUser, AuthResponse } from '../types/Users';
import { z } from 'zod';
import { tokenManager } from '../utils/tokenManager';

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

            // Zod validation
            registerSchema.parse(registerData);

            const response = await axios.post<AuthResponse>(
                'http://localhost:4000/auth/register',
                registerData
            );

            const { token, user, message } = response.data;


            // Store tokens
            console.log(`[INFO] Register successful: ${message}`);
            tokenManager.setToken({ token });
            setUser(user);

            return response.data.user;

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

    // Verify OTP
    const verify = async (email: string, otp: string) => {
        try {
            const verificationData: OtpVerificationPayload = {
                email,
                otp
            };

            const token = tokenManager.getToken();


            // Zod validation
            otpVerificationSchema.parse(verificationData);

            const response = await axios.post('http://localhost:4000/auth/verify', verificationData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }

            );


            const { user: verifiedUser } = response.data;

            setUser(prevUser => prevUser ? {
                ...prevUser,
                verification: verifiedUser.verification
            } : null);

            router.push("/completeprofile/personalinfo")

            return response.data;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors[0].message;
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Verification failed';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            throw error;
        }
    };

    // Resend OTP
    const resendOTP = async (email: string | null) => {
        if (!email) {
            throw new Error('Email is required');
        }

        const token = tokenManager.getToken();
        try {
            const response = await axios.post('http://localhost:4000/auth/resend-otp', { email }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });


            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            throw error;
        }
    };

    // Cancel Verification
    const cancelVerification = async (email: string | null) => {
        if (!email) {
            throw new Error('Email is required');
        }

        const token = tokenManager.getToken();


        try {
            const response = await axios.post('http://localhost:4000/auth/verify/cancel', { email }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            // Clear tokens and user on cancellation
            tokenManager.clearToken();
            setUser(null);

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Cancellation failed';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            const loginData: LoginPayload = { email, password };
            await loginSchema.parse(loginData);

            const response = await axios.post<AuthResponse>(
                'http://localhost:4000/auth/login',
                loginData
            );

            const { token, user, message } = response.data;

            // Make sure we're setting tokens correctly
            if (typeof token === 'string') {
                console.log("Setting tokens:", token);
                tokenManager.setToken({ token: token });
                setUser(user);
                console.log(`[INFO] Login successful: ${message}`);

                // Check verification status and redirect
                if (user.verification.isVerified) {
                    router.push("/home");
                } else {
                    //  CALL IN THE VERIFICATION HOOK
                }

                return user;
            } else {
                console.error("Unexpected token format:", token);
                throw new Error('Invalid token received from server');
            }
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

    // Logout Method
    // ! Will utilize a more robust session management in the future
    const logout = async () => {

        tokenManager.clearToken();
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