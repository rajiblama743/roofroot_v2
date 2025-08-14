'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/authUtils';

interface WithAgencyGuardProps {
  children: React.ReactNode;
}

export function withAgencyGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AgencyGuardedComponent(props: P) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          // Check if user is authenticated
          const isLocallyAuthenticated = authUtils.isAuthenticated();
          
          if (!isLocallyAuthenticated) {
            router.push('/agency/login');
            return;
          }

          // Get user data from sessionStorage (same as other components)
          const userData = sessionStorage.getItem('user');
          if (!userData) {
            router.push('/agency/login');
            return;
          }
          
          const parsedUser = JSON.parse(userData);
          if (parsedUser.role !== 'agency') {
            router.push('/login');
            return;
          }

          setIsAuthenticated(true);
          
        } catch (error) {
          console.error('Auth check error:', error);
          router.push('/login');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, []); // Remove router dependency to prevent continuous re-runs

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Hook for agency guard
export const useAgencyGuard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authUtils.isAuthenticated()) {
          router.push('/agency/login');
          return;
        }

        const userData = sessionStorage.getItem('user');
        if (!userData) {
          router.push('/agency/login');
          return;
        }
        
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'agency') {
          router.push('/agency/login');
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
  }, []); // Remove router dependency to prevent continuous re-runs

  return { isLoading, isAuthenticated };
};
