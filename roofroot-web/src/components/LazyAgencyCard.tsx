import dynamic from 'next/dynamic';
import AgencyCardSkeleton from './AgencyCardSkeleton';

// Lazy load agency card component with skeleton fallback
const AgencyCard = dynamic(() => import('./AgencyCard'), {
  ssr: true,
  loading: () => <AgencyCardSkeleton />
});

interface LazyAgencyCardProps {
  agency: any;
  onClick: (agencyName: string) => void;
}

export default function LazyAgencyCard({ agency, onClick }: LazyAgencyCardProps) {
  return (
    <AgencyCard 
      agency={agency} 
      onClick={onClick}
    />
  );
}
