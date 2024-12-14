// src/hooks/useAuth.ts
"use client"
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { loginSchema, registerSchema, otpVerificationSchema, LoginPayload, RegisterPayload, OtpVerificationPayload } from '../validators/authValidation';
import { AuthUser, AuthResponse } from '../types/Users';
import { z } from 'zod';

// Define token interface
interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

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

            // If token is expired and we haven't tried to refresh yet
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const newAccessToken = await refreshAccessToken();
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return authAxios(originalRequest);
                } catch {
                    return Promise.reject(error);
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
                token: response.data.token
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
            await router.push('/home');


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