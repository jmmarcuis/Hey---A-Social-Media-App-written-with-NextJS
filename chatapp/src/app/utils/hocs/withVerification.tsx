// hocs/withVerification.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useIsVerified from '@/app/hooks/useVerified';
import Spinner from '@/app/components/Spinner';
import toast from 'react-hot-toast';

function withVerification<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function VerifiedProtectedComponent(props: P) {
    const { isVerified, loading, error } = useIsVerified();
    const router = useRouter();

    useEffect(() => {
      if (!loading && error) {
        console.error('Error checking verification:', error);
        toast.error('Session expired. Please login again.');
        router.push('/login');
      }
      if (!loading && isVerified === false) {
        toast.error('Your account needs to be verified. Please check your email.', {
          duration: 1000,
          position: 'top-center',
          icon: '✉️',
        });
        router.push('/verification');
      }
    }, [loading, error, isVerified, router]);

    if (loading) {
      return <Spinner />;
    }
    if (error || isVerified === false) {
      return null;
    }
    return <WrappedComponent {...props} />;
  };
}
export default withVerification;