"use client";
import { ReactNode } from 'react';
import Stepper from '../components/completeProfile/Stepper';
import ThemeToggle from '../components/icons/ThemeToggle';

export default function CompleteProfileLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex place-content-center items-center justify-center p-4 md:p-8 bg-white dark:bg-black relative ">
            <div className="w-full max-w-2xl h-full max-h-4xl    border-black border-2 bg-white dark:bg-black rounded-2xl  p-6 md:p-8 ">
                <Stepper />
                <div className="flex-1 mt-4">{children}</div>

            </div>



            <ThemeToggle />

        </div>
    );
}