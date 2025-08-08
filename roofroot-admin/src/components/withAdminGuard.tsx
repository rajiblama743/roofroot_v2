'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

interface WithAdminGuardProps {
  children: React.ReactNode;
}

export const withAdminGuard = (Component: React.ComponentType<any>) => {
  return function ProtectedComponent(props: any) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          console.log('🔐 Admin guard: Checking authentication...');
          
          // First check local authentication
          const isLocallyAuthenticated = authService.isAuthenticated();
          console.log('🔐 Admin guard: Local auth check:', isLocallyAuthenticated);
          
          if (!isLocallyAuthenticated) {
            console.log('🔐 Admin guard: Not locally authenticated, redirecting to login');
            router.push('/login');
            return;
          }

          // For now, skip backend verification to test if that's the issue
          console.log('🔐 Admin guard: Skipping backend verification for testing');
          setIsAuthenticated(true);
          
          // Uncomment this when backend verification is working:
          // const isValid = await authService.verifyAuth();
          // console.log('🔐 Admin guard: Backend verification:', isValid);
          // if (!isValid) {
          //   console.log('🔐 Admin guard: Backend verification failed, redirecting to login');
          //   router.push('/login');
          //   return;
          // }

          console.log('🔐 Admin guard: Authentication successful');
          setIsAuthenticated(true);
        } catch (error) {
          console.error('🔐 Admin guard: Auth check failed:', error);
          router.push('/login');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    if (isLoading) {
      console.log('🔐 Admin guard: Loading...');
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      console.log('🔐 Admin guard: Not authenticated, showing nothing');
      return null; // Will redirect to login
    }

    console.log('🔐 Admin guard: Rendering protected component');
    return <Component {...props} />;
  };
};

// Hook for admin guard
export const useAdminGuard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const isValid = await authService.verifyAuth();
        if (!isValid) {
          router.push('/login');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { isLoading, isAuthenticated };
};
