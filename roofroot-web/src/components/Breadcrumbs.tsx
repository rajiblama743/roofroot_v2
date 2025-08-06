'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

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
    <nav className={`text-base sm:text-sm text-gray-500 overflow-x-auto scrollbar-hide whitespace-nowrap ${className}`}>
      <div className="inline-flex items-baseline gap-2 sm:gap-1">
        {items.map((item, index) => (
          <div key={index} className="inline-flex items-baseline">
            {/* Separator */}
            {index > 0 && (
              <div className="inline-flex items-baseline">
                <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4 mx-2 sm:mx-1 text-gray-400 flex-shrink-0" />
              </div>
            )}
            
            {/* Item */}
            {index === items.length - 1 ? (
              // Last item (current page) - not clickable
              <span className="text-gray-700 font-medium truncate max-w-[140px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[180px] xl:max-w-none">
                {item.name}
              </span>
            ) : (
              // Clickable link
              <Link
                href={item.href || '#'}
                className="hover:text-blue-600 hover:underline transition-colors truncate max-w-[120px] sm:max-w-[100px] md:max-w-[120px] lg:max-w-[150px] xl:max-w-[180px]"
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
} 