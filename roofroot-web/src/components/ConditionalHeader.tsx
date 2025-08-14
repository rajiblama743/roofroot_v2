'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show Header for agency routes
  const isAgencyRoute = pathname.startsWith('/agency');
  
  if (isAgencyRoute) {
    return null;
  }
  
  return <Header />;
}

