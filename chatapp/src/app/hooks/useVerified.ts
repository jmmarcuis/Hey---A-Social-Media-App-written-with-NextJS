// hooks/useIsVerified.js
"use client";
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { VerifiedResponse } from '../types/Users';
import { tokenManager } from '../utils/tokenManager';

const useIsVerified = () => {
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkVerification = async () => {
            try {
                const token = tokenManager.getToken();
                if (!token) {
                    setError('No token found');
                    setLoading(false);
                    return;
                }

                const response = await axios.get<VerifiedResponse>(
                    'http://localhost:4000/validation/isVerified',
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                const { success, userVerificationStatus } = response.data;

                if (success) {
                    console.log(userVerificationStatus);
                    setIsVerified(userVerificationStatus.verification.isVerified);
                } else {
                    setIsVerified(false);
                }

                setLoading(false);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError<VerifiedResponse>;
                    if (axiosError.response?.data.success === false) {
                        setIsVerified(false);
                    } else {
                        setError('Error checking verification');
                    }
                } else {
                    setError('Error checking verification');
                }
                setLoading(false);
            }
        };

        checkVerification();
    }, []);

    return { isVerified, loading, error };
};

export default useIsVerified;