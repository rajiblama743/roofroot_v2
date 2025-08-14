'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Search, 
  Settings, 
  LogOut,
  Building2
} from 'lucide-react';
import { Sidebar, Header } from '@/components/shared';
import { authUtils } from '@/lib/authUtils';

interface AgencyLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/agency', icon: Home },
  { name: 'Listings', href: '/agency/listings', icon: Search },
  { name: 'Settings', href: '/agency/settings', icon: Settings },
];

export default function AgencyLayout({ children }: AgencyLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        if (!authUtils.isAuthenticated()) {
          router.push('/agency/login');
          return;
        }

        // Get user data from sessionStorage (same as Header component)
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

        setUser(parsedUser);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Remove router dependency to prevent continuous re-runs

  const handleSignOut = () => {
    // Clear all auth data
    sessionStorage.clear();
    localStorage.removeItem('user');
    window.location.href = '/';
  };

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

  if (!user) {
    return null;
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        navigation={navigation}
        logo={{
          src: "/roofchains-logo.png",
          alt: "RoofChains Logo",
          title: "RoofChains Agency"
        }}
        bottomContent={
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user.agencyName || user.name}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        }
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
