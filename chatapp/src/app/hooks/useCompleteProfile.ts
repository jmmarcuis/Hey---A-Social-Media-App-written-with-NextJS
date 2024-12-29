// hooks/useIsVerified.js
"use client";
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { CompleteProfileResponse } from '../types/Users';
import { tokenManager } from '../utils/tokenManager';

const useCompleteProfile = () => {
    const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const checkProfileComplete = async () => {
            try {
                const token = tokenManager.getToken();
                if (!token) {
                    setError('No token found');
                    setLoading(false);
                    return;
                }

                const response = await axios.get<CompleteProfileResponse>(
                    'http://localhost:4000/validation/isProfileComplete',
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );

                const { success, userProfileStatus } = response.data;

                if (success) {
                    console.log(userProfileStatus);
                    setIsProfileComplete(userProfileStatus.isComplete);
                } else {
                    setIsProfileComplete(false);
                }

                setLoading(false);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError<CompleteProfileResponse>;
                    if (axiosError.response?.data.success === false) {
                        setIsProfileComplete(false);
                    } else {
                        setError('Error checking verification');
                    }
                } else {
                    setError('Error checking verification');
                }
                setLoading(false);
            }
        };

        checkProfileComplete();
    }, []);

    return { isProfileComplete, loading, error };

};

export default useCompleteProfile;