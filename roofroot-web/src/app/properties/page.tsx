'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  ChevronLeft, 
  ChevronRight,
  Grid,
  List
} from 'lucide-react';
import { apiClient, Listing, ListingFilters } from '@/lib/api';
import { formatPrice, formatDate, truncateText, imageUtils, paginationUtils } from '@/lib/utils';
import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';

function PropertiesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    limit: 12,
    search: searchParams.get('search') || '',
    type: (searchParams.get('type') as 'sale' | 'lease') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getListings(filters);
      
      if (response.success) {
        setListings(response.listings);
        setPagination({
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        });
      } else {
        setError('Failed to load properties');
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<ListingFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    router.push(`/properties?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    const clearedFilters = { page: 1, limit: 12 };
    setFilters(clearedFilters);
    router.push('/properties');
  };

  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
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
        <div className="mb-4 sm:mb-6">
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
                value={filters.type || 'all'}
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
                value={`${filters.minPrice || ''}-${filters.maxPrice || ''}`}
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
              {(filters.type || filters.minPrice || filters.maxPrice || filters.search) && (
                <button
                  onClick={clearFilters}
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

        {/* Results */}
        {error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchListings}
              className="inline-flex items-center bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Try again
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-gray-500 mb-4">No properties found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Properties Grid/List */}
            <div className={`grid gap-3 sm:gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {listings.map((listing) => (
                <PropertyCard 
                  key={listing.id} 
                  listing={listing} 
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 sm:mt-8 flex items-center justify-center">
                <nav className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {paginationUtils.generatePageNumbers(
                    pagination.page, 
                    pagination.totalPages
                  ).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : undefined}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pageNum === pagination.page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PropertiesPageContent />
    </Suspense>
  );
} 