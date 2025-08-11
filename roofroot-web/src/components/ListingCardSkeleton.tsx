import { Building2 } from 'lucide-react';

interface ListingCardSkeletonProps {
  viewMode: 'grid' | 'list';
}

export default function ListingCardSkeleton({ viewMode }: ListingCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="flex flex-col sm:flex-row">
          {/* Image skeleton */}
          <div className="w-full sm:w-48 h-32 sm:h-32 flex-shrink-0 bg-gray-200"></div>
          
          {/* Content skeleton */}
          <div className="flex-1 p-3 sm:p-4 lg:p-6">
            {/* Title and badge skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2">
              <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20 self-start"></div>
            </div>
            
            {/* Description skeleton */}
            <div className="space-y-2 mb-3">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            
            {/* Location and price skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-24"></div>
            </div>
            
            {/* Date and agency skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-32 sm:h-40 lg:h-48 bg-gray-200">
        {/* Badge skeleton */}
        <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Title skeleton */}
        <div className="h-4 sm:h-5 lg:h-6 bg-gray-200 rounded mb-2"></div>
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Location skeleton */}
        <div className="h-3 sm:h-4 bg-gray-200 rounded mb-3 w-1/2"></div>

        {/* Price and date skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Agency skeleton */}
        <div className="flex items-center justify-center sm:justify-start pt-3 border-t border-gray-100 min-h-[2rem] sm:min-h-0">
          <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 mr-2 flex-shrink-0" />
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}
