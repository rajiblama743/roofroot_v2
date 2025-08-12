import AgencyCardSkeleton from '@/components/AgencyCardSkeleton';

export default function FindAgencyLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-6 sm:pt-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 bg-gray-200 rounded mb-2 w-2/3 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>

        {/* Search Form Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Agency Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <AgencyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
