"use client";

import ThemeToggle from '@/app/components/icons/ThemeToggle';
import { useAuth } from '@/app/hooks/useAuth';
import withAuth from '@/app/utils/hoc';

function Home() {
    const { logout } = useAuth();  

    const handleLogout = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        logout();  
    };

    return (
        <div className="h-screen flex items-center flex-col justify-center bg-white dark:bg-black">
            <h1 className='my-3 text-black dark:text-white'>Hello if you are here that means that you have logged in successfully</h1>
            <button
                onClick={handleLogout}
                className="border-2 border-black dark:border-white p-2.5 px-5 rounded-lg transition duration-300 ease-in-out hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white">
                Logout Button
            </button>
            <ThemeToggle />
        </div>
    );
}

export default withAuth(Home); // Wrap the component with the HOC
