// hocs/withVerification.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useIsVerified from '@/app/hooks/useVerified';
import Spinner from '@/app/components/Spinner';
function withVerification<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function VerifiedProtectedComponent(props: P) {
    const { isVerified, loading, error } = useIsVerified();
    const router = useRouter();

    useEffect(() => {
      if (!loading && error) {
        console.error('Error checking verification:', error);
        router.push('/login');
      }

      if (!loading && isVerified === false) {
        console.log(isVerified);
        // router.push('/home');
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