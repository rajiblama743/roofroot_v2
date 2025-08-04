'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { apiClient, Agency, AgencySearchFilters } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function FindAgencyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  useEffect(() => {
    fetchAgencies();
  }, [searchParams]);

  const fetchAgencies = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: AgencySearchFilters = {
        page,
        limit: 12,
        search: searchParams.get('search') || undefined,
      };

      const response = await apiClient.searchAgencies(params);
      
      if (response.success) {
        setAgencies(response.agencies || []);
        setPagination({
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        });
      } else {
        setError(response.message || 'Failed to load agencies');
      }
    } catch (err: any) {
      console.error('Error fetching agencies:', err);
      setError('Failed to load agencies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/find-agency?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handlePageChange = (page: number) => {
    const currentSearch = searchParams.get('search') || '';
    const newSearchParams = new URLSearchParams();
    if (currentSearch) {
      newSearchParams.set('search', currentSearch);
    }
    if (page > 1) {
      newSearchParams.set('page', page.toString());
    }
    router.push(`/find-agency?${newSearchParams.toString()}`);
  };

  const handleAgencyClick = (agencyName: string) => {
    router.push(`/agency/${encodeURIComponent(agencyName)}?from=find-agency`);
  };

  if (loading && agencies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-6 sm:pt-20 sm:pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
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
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Find Your Nearby Agencies
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Discover trusted real estate agencies in your area
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search agencies by location (e.g., Sydney, Melbourne, Brisbane)"
                className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Search Agencies
            </button>
          </form>
        </div>

        {/* Results */}
        {error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Agencies Found</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">{error}</p>
          </div>
        ) : agencies.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Agencies Found</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              {searchParams.get('search') 
                ? `No agencies found for "${searchParams.get('search')}". Try a different location.`
                : 'Search for agencies in your area to get started.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            {pagination.total > 0 && (
              <div className="mb-4 sm:mb-6">
                <p className="text-sm text-gray-600">
                  Found {pagination.total} agency{pagination.total !== 1 ? 'ies' : ''}
                  {searchParams.get('search') && ` in "${searchParams.get('search')}"`}
                </p>
              </div>
            )}

            {/* Agencies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {agencies.map((agency) => (
                <div
                  key={agency._id}
                  onClick={() => handleAgencyClick(agency.agencyName || agency.name)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* Agency Logo/Icon */}
                  <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>

                  {/* Agency Details */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                      {agency.agencyName || agency.name}
                    </h3>
                    
                    {agency.agencyDescription && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {agency.agencyDescription}
                      </p>
                    )}

                    {/* Contact Information */}
                    <div className="space-y-2">
                      {agency.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{agency.email}</span>
                        </div>
                      )}
                      
                      {agency.phoneNumber && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{agency.phoneNumber}</span>
                        </div>
                      )}
                      
                      {agency.address && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{agency.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Agency Info Footer */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Member since {formatDate(agency.createdAt)}</span>
                        <span className="text-blue-600 font-medium">View Details</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <nav className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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