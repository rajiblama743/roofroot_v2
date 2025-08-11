import dynamic from 'next/dynamic';
import ListingCardSkeleton from './ListingCardSkeleton';

const PropertyCard = dynamic(() => import('./PropertyCard'), {
  ssr: true,
  loading: () => <ListingCardSkeleton viewMode="grid" />
});

export default PropertyCard;
