'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  Grid,
  List
} from 'lucide-react';
import { apiClient, Listing, ListingFilters } from '@/lib/api';
import { formatPrice, formatDate, truncateText, imageUtils, paginationUtils } from '@/lib/utils';
import LazyPropertyCard from '@/components/LazyPropertyCard';
import ListingCardSkeleton from '@/components/ListingCardSkeleton';
import SearchBar from '@/components/SearchBar';
import { useInfiniteScrollFetch } from '@/hooks/useInfiniteScrollFetch';

// Separate component for the properties list to enable Suspense
function PropertiesList({ viewMode, onFilterChange, onClearFilters }: { 
  viewMode: 'grid' | 'list';
  onFilterChange: (filters: Partial<ListingFilters>) => void;
  onClearFilters: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<ListingFilters>({
    search: searchParams.get('search') || '',
    type: (searchParams.get('type') as 'sale' | 'lease') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
  });

  // Infinite scroll hook for listings
  const {
    items: listings,
    isLoading,
    isInitialLoading,
    isFetchingMore,
    isError,
    error,
    hasMore,
    total,
    hasFetchedOnce,
    reset,
    setFilters: setInfiniteScrollFilters,
    sentinelRef,
    page
  } = useInfiniteScrollFetch<Listing>({
    fetcher: async (page: number, filters: ListingFilters) => {
      try {
        const response = await apiClient.getListings({
          ...filters,
          page,
          limit: 20
        });
        return response;
      } catch (err) {
        throw err;
      }
    },
    filters,
    deps: [filters.search, filters.type, filters.minPrice, filters.maxPrice],
    enabled: true
  });

  // Update infinite scroll filters when local filters change
  useEffect(() => {
    setInfiniteScrollFilters(filters);
  }, [filters, setInfiniteScrollFilters]);

  const handleFilterChange = (newFilters: Partial<ListingFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    router.push(`/properties?${params.toString()}`);
    
    // Notify parent component
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    router.push('/properties');
    onClearFilters();
  };

  // Show skeletons during initial loading
  if (isInitialLoading) {
    return (
      <div className="grid gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <ListingCardSkeleton key={i} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  // Show error UI
  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
        <p className="text-sm sm:text-base text-gray-500 mb-4">{error}</p>
        <button
          onClick={reset}
          className="inline-flex items-center bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          Try again
        </button>
      </div>
    );
  }

  // Show empty state only after first fetch completes and there are truly no results
  if (listings.length === 0 && hasFetchedOnce) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
        <p className="text-sm sm:text-base text-gray-500 mb-4">
          No properties found matching your criteria.
        </p>
        <button
          onClick={clearFilters}
          className="inline-flex items-center bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          Clear filters
        </button>
      </div>
    );
  }

  // Show properties list
  return (
    <>
      {/* Properties Grid/List */}
      <div 
        className={`grid gap-3 sm:gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}
        aria-busy={isLoading}
      >
        {listings.map((listing) => (
          <LazyPropertyCard 
            key={listing.id} 
            listing={listing} 
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Loading More Skeleton - show inline skeletons at list end while fetching more */}
      {isFetchingMore && (
        <div className={`grid gap-3 sm:gap-4 mt-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {[1, 2, 3, 4].map((i) => (
            <ListingCardSkeleton key={`loading-${i}`} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* End of List Message */}
      {!hasMore && listings.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            {total > 0 ? `Showing all ${total} properties` : 'No more properties to load'}
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
  );
}

function PropertiesPageContent() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentFilters, setCurrentFilters] = useState<ListingFilters>({});

  const handleFilterChange = (filters: Partial<ListingFilters>) => {
    setCurrentFilters(prev => ({ ...prev, ...filters }));
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-6 sm:pt-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Properties
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Discover verified properties from trusted agencies
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 sm:mb-6">
          <SearchBar />
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-sm font-medium text-gray-700">Filters:</span>
              
              {/* Property Type Filter */}
              <select
                value={currentFilters.type || 'all'}
                onChange={(e) => handleFilterChange({ 
                  type: e.target.value === 'all' ? undefined : e.target.value as 'sale' | 'lease' 
                })}
                className="text-sm border border-gray-300 rounded-md px-2 sm:px-3 py-2 sm:py-1.5 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              >
                <option value="all">All Types</option>
                <option value="sale">For Sale</option>
                <option value="lease">For Lease</option>
              </select>

              {/* Price Range Filter */}
              <select
                value={`${currentFilters.minPrice || ''}-${currentFilters.maxPrice || ''}`}
                onChange={(e) => {
                  const [min, max] = e.target.value.split('-');
                  handleFilterChange({
                    minPrice: min ? parseInt(min) : undefined,
                    maxPrice: max ? parseInt(max) : undefined,
                  });
                }}
                className="text-sm border border-gray-300 rounded-md px-2 sm:px-3 py-2 sm:py-1.5 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              >
                <option value="-">Any Price</option>
                <option value="0-100000">Under $100,000</option>
                <option value="100000-250000">$100,000 - $250,000</option>
                <option value="250000-500000">$250,000 - $500,000</option>
                <option value="500000-1000000">$500,000 - $1,000,000</option>
                <option value="1000000-">Over $1,000,000</option>
              </select>

              {/* Clear Filters */}
              {(currentFilters.type || currentFilters.minPrice || currentFilters.maxPrice || currentFilters.search) && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full sm:w-auto text-left sm:text-center py-2 sm:py-0"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-sm text-gray-700">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Properties List with Suspense */}
        <Suspense fallback={
          <div className="grid gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ListingCardSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        }>
          <PropertiesList 
            viewMode={viewMode} 
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return <PropertiesPageContent />;
}