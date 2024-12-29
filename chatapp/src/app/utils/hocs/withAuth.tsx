// hocs/withAuth.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";  // Changed from next/router
 import Spinner from "../../components/Spinner";
import { tokenManager } from "../tokenManager";

function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AuthProtectedComponent(props: P) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
 
    useEffect(() => {
      const checkAuth = () => {
        const token = tokenManager.getToken();
        if (token) {
          setIsAuthenticated(true);
        } else {
          tokenManager.clearToken();
          router.push("/login");
        }
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      };
      checkAuth();
    }, [ router]);

    if (isLoading) {
      return <Spinner />;
    }

    if (!isAuthenticated) {
      console.log("You aren't supposed to be here");
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withAuth;