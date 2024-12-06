import Link from 'next/link';
import ThemeToggle from '@/app/components/icons/ThemeToggle';

export default function signup() {
    return (
      <div className="h-screen flex items-center  flex-col justify-center bg-white dark:bg-black">
        <h1 className="text-3xl  text-black dark:text-white">Welcome to the Signup Page</h1>
        <p className=' text-black dark:text-white'>
        Don&apos;t have an account yet?{' '}       
        <Link className='underline' href="/login"> Click here</Link>
      </p>

      
      <ThemeToggle />
      </div>
    );
  }
  