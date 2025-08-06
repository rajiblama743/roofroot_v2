'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className={`text-sm sm:text-base text-gray-500 overflow-x-auto scrollbar-hide whitespace-nowrap ${className}`}>
      <div className="flex items-baseline gap-2 sm:gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-baseline">
            {/* Home icon for first item if it's "Home" */}
            {index === 0 && item.name === 'Home' ? (
              <Link
                href={item.href || '/'}
                className="hover:text-blue-600 hover:underline transition-colors p-1 -m-1 rounded flex items-baseline"
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            ) : (
              <>
                {/* Separator */}
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 mx-2 sm:mx-3 text-gray-400 flex-shrink-0" />
                )}
                
                {/* Item */}
                {index === items.length - 1 ? (
                  // Last item (current page) - not clickable
                  <span className="text-gray-700 font-semibold truncate max-w-[120px] sm:max-w-[150px] md:max-w-[180px] lg:max-w-[220px] xl:max-w-none">
                    {item.name}
                  </span>
                ) : (
                  // Clickable link
                  <Link
                    href={item.href || '#'}
                    className="hover:text-blue-600 hover:underline transition-colors truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[180px] xl:max-w-[220px] p-1 -m-1 rounded"
                  >
                    {item.name}
                  </Link>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
} 