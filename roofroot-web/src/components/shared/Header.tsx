'use client';

import { User, LogOut } from 'lucide-react';

interface HeaderProps {
  user: {
    name: string;
    email?: string;
    agencyName?: string;
  } | null;
  onSignOut: () => void;
  className?: string;
}

export default function Header({ user, onSignOut, className = '' }: HeaderProps) {
  const displayName = user?.agencyName || user?.name || 'User';

  return (
    <div className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 ${className}`}>
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1" />
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Profile section */}
          <div className="flex items-center gap-x-4">
            <div className="flex items-center gap-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {displayName}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="flex items-center gap-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

