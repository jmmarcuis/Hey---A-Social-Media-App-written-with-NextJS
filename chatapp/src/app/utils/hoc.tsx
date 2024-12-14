// src/app/utils/hoc.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AuthProtectedComponent(props: P) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { getAccessToken, verifyToken, refreshAccessToken, clearTokens } = useAuth();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const accessToken = getAccessToken();
          if (!accessToken) {
            throw new Error('No access token');
          }

          // First try to verify the current token
          try {
            await verifyToken();
            setIsAuthenticated(true);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (verifyError) {
            // If verification fails, try to refresh the token
            try {
              await refreshAccessToken();
              // After successful refresh, verify again
              await verifyToken();
              setIsAuthenticated(true);
            } catch (refreshError) {
              throw refreshError;
            }
          }
        } catch (error) {
          console.error('Authentication failed:', error);
          clearTokens();
          router.push('/login');
        }
      };

      checkAuth();
    }, [getAccessToken, verifyToken, refreshAccessToken, clearTokens, router]);

    if (!isAuthenticated) {
      return null; // Or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };
}

export default withAuth;