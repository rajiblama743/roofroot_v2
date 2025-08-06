'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Calendar, MapPin, DollarSign, Mail, Phone, MapPin as MapPinIcon } from 'lucide-react';
import { apiClient, Listing, ListingFilters } from '@/lib/api';
import { formatPrice, formatDate, truncateText, imageUtils, paginationUtils } from '@/lib/utils';
import PropertyCard from '@/components/PropertyCard';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/Breadcrumbs';

interface AgencyInfo {
  name: string;
  agencyName?: string;
  email?: string;
  phoneNumber?: string;
  agencyDescription?: string;
  address?: string;
}

export default function AgencyListingsPage() {
  const params = useParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  // Determine back button destination based on referrer
  const getBackButtonDestination = () => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      const currentUrl = window.location.href;
      
      // Check if we came from find-agency page
      if (referrer.includes('/find-agency') || referrer.includes('find-agency')) {
        return '/find-agency';
      }
      
      // Check if we came from search results
      if (referrer.includes('search') && referrer.includes('agencies')) {
        return '/find-agency';
      }
      
      // Check if the current URL has a query parameter indicating we came from find-agency
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('from') === 'find-agency') {
        return '/find-agency';
      }
    }
    return '/properties';
  };

  const agencyName = decodeURIComponent(params.agencyName as string);

  useEffect(() => {
    fetchAgencyListings();
  }, [agencyName]);

  const fetchAgencyListings = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getListingsByAgency(agencyName, {
        page,
        limit: 12
      });
      
      if (response.success) {
        setListings(response.listings);
        setAgencyInfo(response.agencyInfo);
        setPagination({
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        });
      } else {
        setError(response.message || 'Failed to load agency listings');
      }
    } catch (err: any) {
      console.error('Error fetching agency listings:', err);
      if (err.response?.status === 404) {
        setError('Agency not found. The agency may not exist or have no listings.');
      } else {
        setError('Failed to load agency listings. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchAgencyListings(page);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-6 sm:pt-20 sm:pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Agency Not Found</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{error}</p>
            <Link
              href="/properties"
              className="inline-flex items-center bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = agencyInfo?.agencyName || agencyInfo?.name || agencyName;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-6 sm:pt-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          {/* Breadcrumbs */}
          <div className="mb-3 sm:mb-4 px-2 sm:px-1">
            <Breadcrumbs
              items={[
                { name: 'Home', href: '/' },
                { name: 'Find Agency', href: '/find-agency' },
                { name: displayName || 'Agency' }
              ]}
            />
          </div>


          
          {/* Agency Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            {/* Desktop Layout */}
            <div className="hidden lg:flex lg:flex-row gap-6">
              {/* Left side - Agency info */}
              <div className="flex flex-row items-start gap-6 flex-1">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
                    {displayName}
                  </h1>
                  
                  {/* Agency Description */}
                  {agencyInfo?.agencyDescription && (
                    <p className="text-sm text-gray-600 mb-3">
                      {agencyInfo.agencyDescription}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Right side - Contact Information */}
              {(agencyInfo?.email || agencyInfo?.phoneNumber || agencyInfo?.address) && (
                <div className="w-64 border-l border-gray-200 pl-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {agencyInfo.email && (
                      <div className="flex items-start text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <a 
                          href={`mailto:${agencyInfo.email}`} 
                          className="hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {agencyInfo.email}
                        </a>
                      </div>
                    )}
                    {agencyInfo.phoneNumber && (
                      <div className="flex items-start text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <a 
                          href={`tel:${agencyInfo.phoneNumber}`} 
                          className="hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {agencyInfo.phoneNumber}
                        </a>
                      </div>
                    )}
                    {agencyInfo.address && (
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{agencyInfo.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden">
              {/* Agency info with logo */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                  <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-1">
                    {displayName}
                  </h1>
                  
                  {/* Agency Description */}
                  {agencyInfo?.agencyDescription && (
                    <p className="text-sm text-gray-600 mb-3">
                      {agencyInfo.agencyDescription}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Contact Information */}
              {(agencyInfo?.email || agencyInfo?.phoneNumber || agencyInfo?.address) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {agencyInfo.email && (
                      <div className="flex items-start text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <a 
                          href={`mailto:${agencyInfo.email}`} 
                          className="hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {agencyInfo.email}
                        </a>
                      </div>
                    )}
                    {agencyInfo.phoneNumber && (
                      <div className="flex items-start text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <a 
                          href={`tel:${agencyInfo.phoneNumber}`} 
                          className="hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {agencyInfo.phoneNumber}
                        </a>
                      </div>
                    )}
                    {agencyInfo.address && (
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{agencyInfo.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            {/* Property Count - Left Side */}
            <div className="text-left">
              <p className="text-sm text-gray-600">
                {pagination.total} verified properties from this agency
              </p>
            </div>
            
            {/* View Mode Toggle - Center */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Listings Found</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              This agency doesn't have any active listings at the moment.
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Browse All Properties
            </Link>
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
                  fromAgency={displayName}
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
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