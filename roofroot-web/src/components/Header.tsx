'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Building2, 
  User, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authUtils } from '@/lib/utils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const currentUser = authUtils.getUser();
    setUser(currentUser);
  }, [pathname]); // Re-run when pathname changes

  const handleLogout = () => {
    authUtils.logout();
    window.location.href = '/';
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Properties', href: '/properties', icon: Search },
    { name: 'About Us', href: '/about', icon: Building2 },
    { name: 'Contact', href: '/contact', icon: Building2 },
  ];

  // Simplified user menu - only profile and logout
  const userMenuItems = [
    { name: 'Profile', href: `/profile/${user?._id || ''}`, icon: User },
    { name: 'Logout', href: '#', icon: LogOut, onClick: handleLogout },
  ];

  // Don't show navigation for logged-in agencies
  const shouldShowNavigation = !user || user.role !== 'agency';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={user?.role === 'agency' ? "/dashboard" : "/"} className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">RoofRoot</span>
            </Link>
          </div>

          {/* Desktop Navigation - Only show for non-agency users */}
          {shouldShowNavigation && (
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      pathname === item.href
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side: Auth buttons and mobile menu */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-4">
            {/* Auth buttons - Show on all screen sizes */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block">{user.name}</span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-60 border border-gray-200">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            if (item.onClick) item.onClick();
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  href="/login"
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap px-2 py-2 sm:px-3 sm:py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button - Only show for non-agency users */}
            {shouldShowNavigation && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors touch-manipulation"
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Only show for non-agency users */}
        {shouldShowNavigation && isMenuOpen && (
          <div className="md:hidden relative z-60">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 bg-white">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors touch-manipulation',
                      pathname === item.href
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    )}
                    style={{ minHeight: '44px' }} // Ensure minimum touch target size
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
              
              {user && (
                <div className="border-t border-gray-200 pt-4">
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (item.onClick) item.onClick();
                        }}
                        className="flex items-center px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors touch-manipulation"
                        style={{ minHeight: '44px' }} // Ensure minimum touch target size
                      >
                        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns - Only show when menus are open */}
      {(isUserMenuOpen || isMenuOpen) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMenuOpen(false);
          }}
          style={{ pointerEvents: 'auto' }}
        />
      )}
    </header>
  );
};

export default Header; 