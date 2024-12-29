// hocs/withProfileComplete.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useCompleteProfile from '@/app/hooks/useCompleteProfile';
import Spinner from '@/app/components/Spinner';
function withProfileComplete<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function CompleteProfileProtectedComponent(props: P) {
    const { isProfileComplete, loading, error } = useCompleteProfile();
    const router = useRouter();

    useEffect(() => {
      if (!loading && error) {
        console.error('Error checking verification:', error);
        router.push('/login');
      }

      if (!loading && isProfileComplete === false) {
        console.log("SKIBIDI", isProfileComplete);
        router.push('/completeprofile/personalinfo');
      }
    }, [loading, error, isProfileComplete, router]);

    if (loading) {
      return <Spinner />;
    }

    if (error || isProfileComplete === false) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withProfileComplete;