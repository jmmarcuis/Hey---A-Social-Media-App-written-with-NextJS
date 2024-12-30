// hooks/useIsVerified.js
"use client";
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { IsCompleteProfileResponse, CompleteProfileResponse } from '../types/Users';
import { tokenManager } from '../utils/tokenManager';
import { ProfilePayload, profileSchema } from '../validators/profileValidation';
import { z } from 'zod';
const useCompleteProfile = () => {
    const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // Check if user has completed their profile
    useEffect(() => {
        const checkProfileComplete = async () => {
            try {
                const token = tokenManager.getToken();
                if (!token) {
                    setError('No token found');
                    setLoading(false);
                    return;
                }

                const response = await axios.get<IsCompleteProfileResponse>(
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
                    const axiosError = error as AxiosError<IsCompleteProfileResponse>;
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


    const completeProfile = async (profileData: ProfilePayload): Promise<CompleteProfileResponse> => {
        setLoading(true);
        setError(null);
      
        const token = tokenManager.getToken();
        if (!token) {
          setError("No token found");
          setLoading(false);
          return {
            success: false,
            message: "No token found",
          };
        }
      
        try {
          // Validate the data using Zod
          profileSchema.parse(profileData);
      
          // Send the API request
          const response = await axios.post<CompleteProfileResponse>(
            "http://localhost:4000/profile/completeprofile",
            profileData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
      
          if (response.data.success) {
            return response.data;
          } else {
            throw new Error(response.data.message || "Unknown error occurred");
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            // Handle validation errors
            const validationError = error.errors.map((e) => e.message).join(", ");
            setError(validationError);
            return {
              success: false,
              message: validationError,
            };
          } else if (axios.isAxiosError(error) && error.response) {
            // Handle API errors
            const apiError = error.response.data?.message || "Server error";
            setError(apiError);
            return {
              success: false,
              message: apiError,
            };
          } else {
            // Handle unexpected errors
            const unexpectedError = error instanceof Error ? error.message : "Unknown error";
            setError(unexpectedError);
            return {
              success: false,
              message: unexpectedError,
            };
          }
        } finally {
          setLoading(false);
        }
      };
      
    return { isProfileComplete, completeProfile, loading, error };

};

export default useCompleteProfile;