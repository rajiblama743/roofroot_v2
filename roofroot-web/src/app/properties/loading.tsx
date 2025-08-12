import ListingCardSkeleton from '@/components/ListingCardSkeleton';

export default function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-6 sm:pt-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-4 sm:mb-6 text-center sm:text-left">
          <div className="h-8 bg-gray-200 rounded mb-2 w-1/3 mx-auto sm:mx-0 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto sm:mx-0 animate-pulse"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-4 sm:mb-6">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Filters Bar Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Properties Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ListingCardSkeleton key={i} viewMode="grid" />
          ))}
        </div>
      </div>
    </div>
  );
}
