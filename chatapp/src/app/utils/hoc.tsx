// src/app/utils/hoc.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define the type for the HOC
function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AuthProtectedComponent(props: P) {
    const router = useRouter();

    useEffect(() => {
      // Check for token in localStorage
      const token = localStorage.getItem('token');

      // If no token exists, redirect to login page
      if (!token) {
        console.log("[DEBUG]: Invalid or Expired token detected")
        router.push('/login');
        return;
      }

    
      // Validate the token every time user access an protected page
      const validateToken = async () => {
        try {
          // Example token validation endpoint
          const response = await fetch('http://localhost:4000/auth/verify-token', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            // Token is invalid, remove it and redirect to login
            localStorage.removeItem('token');
            router.push('/login');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          router.push('/login');
        }
      };

      // Uncomment the following line if you want to validate the token on every protected route access
      validateToken();
    }, [router]);

    // Render the wrapped component
    return <WrappedComponent {...props} />;
  };
}

export default withAuth;