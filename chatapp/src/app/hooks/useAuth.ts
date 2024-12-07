// src/hooks/useAuth.ts
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { loginSchema, registerSchema } from '../validators/authValidation';

interface AuthUser {
    id: string;
    email: string;
    username: string;
    password: string;
    token: string;
    isVerified: boolean;
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

     // Register Hook
    const register = async (username: string, email: string, password: string) => {
        // Reset previous errors
        setError(null);

        // Validate register input using Zod
        const validationResult = registerSchema.safeParse({
            username,
            email,
            password,
            confirmPassword: password // Pass the same password for confirmation
        });

        // Check if current input is valid
        if (!validationResult.success) {
            // Get the first error message
            const errorMessage = validationResult.error.errors[0].message;
            setError(errorMessage);
            throw new Error(errorMessage);
        }

        try {
            const response = await axios.post<{ message: string, user: AuthUser }>(
                'http://localhost:4000/auth/register',
                { username, email, password }
            );

            const { message, user } = response.data;

            // Debug logging
            console.log(`Message: ${message}`);
            console.log(`Username: ${user.username}`);
            console.log(`Email: ${user.email}`);
            console.log(`Verification Status: ${user.isVerified}`);

            // Redirect to OTP request or complete profile
            router.push('/completeProfile');

            return user;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Registration failed';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            throw error;
        }
    }

    // Login Hook
    const login = async (email: string, password: string) => {
        // Reset previous errors
        setError(null);

        // Validate login input using Zod
        const validationResult = loginSchema.safeParse({ email, password });

        if (!validationResult.success) {
            const errorMessage = validationResult.error.errors[0].message;
            setError(errorMessage);
            throw new Error(errorMessage);
        }

        try {
            const response = await axios.post<{ message: string; token: string; user: AuthUser }>(
                'http://localhost:4000/auth/login',
                { email, password }
            );

            const { message, token, user } = response.data;

            // Log the message, username, token and email for debugging purposes
            // Reminder to self, remove this if everything is all skibidi
            console.log(`Message: ${message}`);
            console.log(`Username: ${user.username}`);
            console.log(`Email: ${user.email}`);
            console.log(`Token: ${token}`);


            // Store token securely
            localStorage.setItem('token', token);
            setUser(user);

            // Redirect to dashboard or home page
            router.push('/home');

            return user;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Login failed';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
            throw error;
        }
    };

    // Logout Hook
    const logout = () => {

        console.log("logout function called");
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return {
        user,
        register,
        login,
        logout,
        error
    };
}