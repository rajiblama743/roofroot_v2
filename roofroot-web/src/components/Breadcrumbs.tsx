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
    <nav className={`flex items-center space-x-2 text-sm text-gray-500 overflow-x-auto ${className}`}>
      {/* Home icon for first item if it's "Home" */}
      {items[0]?.name === 'Home' && (
        <Link
          href={items[0].href || '/'}
          className="flex items-center hover:text-blue-600 hover:underline transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>
      )}
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {/* Separator */}
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
          )}
          
          {/* Item */}
          {index === items.length - 1 ? (
            // Last item (current page) - not clickable
            <span className="text-gray-700 font-semibold truncate max-w-[200px] sm:max-w-none">
              {item.name}
            </span>
          ) : (
            // Clickable link
            <Link
              href={item.href || '#'}
              className="hover:text-blue-600 hover:underline transition-colors truncate max-w-[150px] sm:max-w-[200px]"
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
} 