import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/Spinner";

function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AuthProtectedComponent(props: P) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { getToken, clearToken } = useAuth(); 

    useEffect(() => {
      const checkAuth = () => {
        const token = getToken();
        if (token) {
          setIsAuthenticated(true);
        } else {
          clearToken();
          router.push("/login");
        }

        // Delay the loader by 3 seconds becasuse :3
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      };
      checkAuth();
    }, [getToken, clearToken, router]);

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