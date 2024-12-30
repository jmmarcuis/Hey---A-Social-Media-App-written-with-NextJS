"use client";
import { ReactNode } from 'react';
import Stepper from '../components/completeProfile/Stepper';
import ThemeToggle from '../components/icons/ThemeToggle';

export default function CompleteProfileLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex place-content-center items-center justify-center p-4   bg-white dark:bg-black relative ">
            <div className="w-full max-w-xl h-full max-h-4xl border-black dark:border-customGray   border-2 bg-white  dark:bg-black rounded-2xl  p-6  ">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Customize Your Profile
            </h1>
                <Stepper />
                <div className="  mt-4">{children}</div>
            </div>
            <ThemeToggle />

        </div>
    );
}