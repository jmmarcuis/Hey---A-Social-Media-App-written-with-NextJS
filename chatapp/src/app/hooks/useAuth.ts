// src/hooks/useAuth.ts
"use client"
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { loginSchema, registerSchema, otpVerificationSchema, LoginPayload, RegisterPayload, OtpVerificationPayload } from '../validators/authValidation';
import { AuthUser, AuthResponse, TokenPair } from '../types/Users';
import { z } from 'zod';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Centralized token management
    const getAccessToken = useCallback(() => {
        return localStorage.getItem('accessToken');
    }, []);

    const getRefreshToken = useCallback(() => {
        return localStorage.getItem('refreshToken');
    }, []);

    const setTokens = useCallback(({ accessToken, refreshToken }: TokenPair) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }, []);

    const clearTokens = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }, []);


    // Token Refresh Utility
    const refreshAccessToken = async () => {
        try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) throw new Error('No refresh token available');

            const response = await axios.post('http://localhost:4000/auth/refresh-token', {
                refreshToken
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            setTokens({ accessToken, refreshToken: newRefreshToken });

            return accessToken;
        } catch (error) {
            // If refresh fails, logout user
            clearTokens();
            setUser(null);
            router.push('/login');
            throw error;
        }
    };
    // Axios instance with interceptor for token refresh
    const authAxios = axios.create();
    authAxios.interceptors.request.use(
        config => {
            const token = getAccessToken();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        error => Promise.reject(error)
    );

    authAxios.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const newAccessToken = await refreshAccessToken();
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return authAxios(originalRequest);
                } catch (refreshError) {
                    clearTokens();
                    router.push('/login');
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );

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

            // Store tokens
            setTokens(response.data.tokens);

            const authUser: AuthUser = {
                id: response.data.user.id,
                email: response.data.user.email,
                username: response.data.user.username,
                verification: response.data.user.verification,
                tokens: response.data.tokens
            };

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

    // Verify OTP
    const verify = async (email: string, otp: string) => {
        try {
            const verificationData: OtpVerificationPayload = {
                email,
                otp
            };

            // Zod validation
            otpVerificationSchema.parse(verificationData);

            const response = await authAxios.post('http://localhost:4000/auth/verify', verificationData);

            // Update tokens if returned
            if (response.data.tokens) {
                setTokens(response.data.tokens);
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
            const response = await authAxios.post('http://localhost:4000/auth/resend-otp', { email });

            // Update tokens if returned
            if (response.data.tokens) {
                setTokens(response.data.tokens);
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
            const response = await authAxios.post('http://localhost:4000/auth/verify/cancel', { email });

            // Clear tokens and user on cancellation
            clearTokens();
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
            setError(null); // Clear any existing errors
            const loginData: LoginPayload = { email, password };

            // Validate input with Zod
            loginSchema.parse(loginData);

            // Make the login request
            const response = await authAxios.post<{ success: boolean; message: string; tokens: TokenPair; user: AuthUser }>('http://localhost:4000/auth/login', loginData);

            const { message, tokens, user } = response.data;

            // Update local state and storage
            setTokens(tokens);
            setUser(user);

            console.log(`[INFO] Login successful: ${message}`);
            router.push('/home'); // Redirect to home page

            return user; // Return the authenticated user object
        } catch (error) {
            // Handle validation errors from Zod
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors[0].message;
                setError(errorMessage);
                console.error(`[ERROR] Validation failed: ${errorMessage}`);
                throw new Error(errorMessage);
            }

            // Handle Axios errors
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Login failed';
                setError(errorMessage);
                console.error(`[ERROR] Axios error: ${errorMessage}`);
                throw new Error(errorMessage);
            }

            // Fallback for unexpected errors
            console.error('[ERROR] Unexpected error:', error);
            throw error;
        }
    };

    // Logout method
    const logout = async () => {
        try {
            const refreshToken = getRefreshToken();
            if (refreshToken) {
                await authAxios.post('http://localhost:4000/auth/logout', { refreshToken });
            }
            clearTokens();
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
            clearTokens();
            setUser(null);
            router.push('/login');
        }
    };

    // Verify Token
    const verifyToken = async () => {
        try {
            const accessToken = getAccessToken();
            if (!accessToken) throw new Error('No access token available');

            const response = await axios.get('http://localhost:4000/auth/verify-token', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            return response.data.user;
        } catch (error) {
            throw error;
        }
    };

    return {
        user,
        register,
        verify, refreshAccessToken, getAccessToken, clearTokens,
        resendOTP,
        cancelVerification, verifyToken,
        login,
        logout,
        error
    };
}