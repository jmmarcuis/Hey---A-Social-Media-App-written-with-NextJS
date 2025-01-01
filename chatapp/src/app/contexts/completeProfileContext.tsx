"use client"
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { ProfilePayload } from '../validators/profileValidation';

interface ProfileContextType {
    profileData: ProfilePayload;
    updateProfileData: (data: Partial<ProfilePayload>) => void;
}

export const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
    // Initialize state from localStorage or use default values
    const [profileData, setProfileData] = useState<ProfilePayload>(() => {
        if (typeof window !== 'undefined') {
            const savedProfileData = localStorage.getItem('profileData');
            const parsedData = savedProfileData ? JSON.parse(savedProfileData) : null;
            return parsedData
                ? {
                      ...parsedData,
                      dateOfBirth: parsedData.dateOfBirth ? new Date(parsedData.dateOfBirth).toISOString() : null,
                  }
                : {
                      firstName: '',
                      lastName: '',
                      bio: '',
                      profilePicture: undefined,
                      coverPicture: undefined,
                      gender: 'male',
                      dateOfBirth: new Date().toISOString(),
                  };
        }
        return {
            firstName: '',
            lastName: '',
            bio: '',
            profilePicture: undefined,
            coverPicture: undefined,
            gender: 'male',
            dateOfBirth: new Date().toISOString(),
        };
    });
    
    const updateProfileData = (data: Partial<ProfilePayload>) => {
        setProfileData((prevData) => {
            const newData = {
                ...prevData,
                ...data,
            };
            // Save to localStorage as JSON string
            if (typeof window !== 'undefined') {
                localStorage.setItem(
                    'profileData',
                    JSON.stringify({
                        ...newData,
                        dateOfBirth: newData.dateOfBirth ? new Date(newData.dateOfBirth).toISOString() : null,
                    })
                );
            }
            return newData;
        });
    };
    

    // Optional: Sync with localStorage whenever profileData changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('profileData', JSON.stringify(profileData));
        }
    }, [profileData]);

    return (
        <ProfileContext.Provider value={{ profileData, updateProfileData }}>
            {children}
        </ProfileContext.Provider>
    );
}

