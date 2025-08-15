'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show Header for agency dashboard routes (but show for public find-agency routes)
  const isAgencyDashboardRoute = pathname.startsWith('/agency') && !pathname.startsWith('/agency/login');
  
  if (isAgencyDashboardRoute) {
    return null;
  }
  
  return <Header />;
}

