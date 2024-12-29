// src/hooks/useAuth.ts
"use client"
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { loginSchema, registerSchema, otpVerificationSchema, LoginPayload, RegisterPayload, OtpVerificationPayload } from '../validators/authValidation';
import { AuthUser, AuthResponse, Token } from '../types/Users';
import { z } from 'zod';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Centralized token management
    const getToken = useCallback(() => {
        return localStorage.getItem("token");
    }, []);

    const setToken = (token: Token) => {
        localStorage.setItem('token', token.token);
    };

    const clearToken = useCallback(() => {
        localStorage.removeItem("token");
    }, []);


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
            setToken({ token: token });
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

            // Zod validation
            otpVerificationSchema.parse(verificationData);

            const response = await axios.post('http://localhost:4000/auth/verify', verificationData);

            // Update tokens if returned
            if (response.data.tokens) {
                setToken(response.data.tokens);
            }

            const { user: verifiedUser } = response.data;

            setUser(prevUser => prevUser ? {
                ...prevUser,
                verification: verifiedUser.verification
            } : null);

            router.push("/completeProfile")

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

        try {
            const response = await axios.post('http://localhost:4000/auth/resend-otp', { email });

            // Update tokens if returned
            if (response.data.tokens) {
                setToken(response.data.tokens);
            }

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

        try {
            const response = await axios.post('http://localhost:4000/auth/verify/cancel', { email });

            // Clear tokens and user on cancellation
            clearToken();
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
                setToken({ token: token });
                setUser(user);
                console.log(`[INFO] Login successful: ${message}`);

                // Check verification status and redirect
                if (user.verification.isVerified) {
                    router.push("/home");
                } else {
                    router.push("/completeprofile");
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

        clearToken();
        router.push('/login');

    };

    

    return {
        user,
        register,
        verify, getToken, clearToken,
        resendOTP,
        cancelVerification,
        //  verifyToken,
        login,
        logout,
        error
    };
}