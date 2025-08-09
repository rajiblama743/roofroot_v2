'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { apiClient, Agency, AgencySearchFilters } from '@/lib/api';
import { formatDate, slugUtils } from '@/lib/utils';
import toast from 'react-hot-toast';

function FindAgencyContent() {
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
        status: 'active', // Only show active agencies
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
    router.push(`/agency/${slugUtils.generateSlug(agencyName)}?from=find-agency`);
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
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {agencies.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Found {pagination.total} agency{pagination.total !== 1 ? 'ies' : ''}
              </p>
            </div>

            {/* Agency Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {agencies.map((agency) => (
                <div
                  key={agency._id}
                  onClick={() => handleAgencyClick(agency.agencyName || agency.name || '')}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <Image 
                        src="/roofchains-logo.png" 
                        alt="RoofChains Logo" 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 mr-3"
                      />
                      <div>
                                                 <h3 className="font-semibold text-gray-900 text-lg">
                           {agency.agencyName || agency.name}
                         </h3>
                      </div>
                    </div>

                    {agency.agencyDescription && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {agency.agencyDescription}
                      </p>
                    )}

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
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Member since {formatDate(agency.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  {pagination.page > 1 && (
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          page === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  {pagination.page < pagination.totalPages && (
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : !loading && (
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
    }>
      <FindAgencyContent />
    </Suspense>
  );
} 