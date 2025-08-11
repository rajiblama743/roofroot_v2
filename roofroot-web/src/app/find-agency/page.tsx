'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { apiClient, Agency, AgencySearchFilters } from '@/lib/api';
import { formatDate, slugUtils } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useInfiniteScrollFetch } from '@/hooks/useInfiniteScrollFetch';
import AgencyCardSkeleton from '@/components/AgencyCardSkeleton';
import LazyAgencyCard from '@/components/LazyAgencyCard';

function FindAgencyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Infinite scroll hook for agencies
  const {
    items: agencies,
    isLoading,
    isError,
    error,
    hasMore,
    total,
    reset,
    setFilters: setInfiniteScrollFilters,
    sentinelRef
  } = useInfiniteScrollFetch<Agency>({
    fetcher: async (page: number, filters: AgencySearchFilters) => {
      const response = await apiClient.searchAgencies({
        ...filters,
        page,
        limit: 20,
        status: 'active' // Only show active agencies
      });
      return response;
    },
    filters: {
      search: searchTerm,
      status: 'active'
    },
    deps: [searchTerm],
    enabled: true
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/find-agency?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleAgencyClick = (agencyName: string) => {
    router.push(`/agency/${slugUtils.generateSlug(agencyName)}?from=find-agency`);
  };

  // Show loading skeleton on initial load
  if (isLoading && agencies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-6 sm:pt-20 sm:pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <AgencyCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-6 sm:pt-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Real Estate Agencies</h1>
          <p className="text-gray-600">Discover trusted real estate agencies in your area</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by agency name, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </form>

        {/* Error Message */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button
              onClick={reset}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {agencies.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Found {total} agency{total !== 1 ? 'ies' : ''}
              </p>
            </div>

            {/* Agency Grid */}
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
              aria-busy={isLoading}
            >
              {agencies.map((agency) => (
                <LazyAgencyCard 
                  key={agency._id}
                  agency={agency}
                  onClick={() => handleAgencyClick(agency.agencyName || agency.name || '')}
                />
              ))}
            </div>

            {/* Loading More Skeleton */}
            {isLoading && agencies.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <AgencyCardSkeleton key={`loading-${i}`} />
                ))}
              </div>
            )}

            {/* End of List Message */}
            {!hasMore && agencies.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  {total > 0 ? `Showing all ${total} agencies` : 'No more agencies to load'}
                </p>
              </div>
            )}

            {/* Load More Sentinel */}
            <div 
              ref={sentinelRef}
              id="load-more-sentinel"
              className="h-4 w-full"
              aria-hidden="true"
            />
          </>
        ) : !isLoading && (
          <div className="text-center py-12">
            <Image 
              src="/roofchains-logo.png" 
              alt="RoofChains Logo" 
              width={64} 
              height={64} 
              className="w-16 h-16 mx-auto mb-4 opacity-40"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agencies found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for new agencies.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FindAgencyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-16 pb-6 sm:pt-20 sm:pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <AgencyCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <FindAgencyContent />
    </Suspense>
  );
} 