"use client";

import ThemeToggle from '@/app/components/icons/ThemeToggle';
// ! Remove this if only we are done with finishing the complete profile function!
// import withAuth from '@/app/utils/hoc';

function CompleteProfile() {

    return (
        <div className="h-screen flex items-center flex-col justify-center bg-white dark:bg-black ">
            <h1 className='my-3 text-black dark:text-white'>Hello if you are here that means that you have logged in successfully</h1>
            <ThemeToggle />
        </div>
    );
}

// Use this export once protection from unauthorized users
// export default withAuth(CompleteProfile); 

// Temporary measure
export default CompleteProfile; 
