'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Building2, 
  Plus, 
  DollarSign, 
  Calendar,
  Search,
  MapPin,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Share
} from 'lucide-react';
import { apiClient, Listing } from '@/lib/api';
import { formatPrice, formatDate, imageUtils, slugUtils } from '@/lib/utils';
import { handleListingError } from '@/lib/errorHandler';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'lease'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [agencyName, setAgencyName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is agency
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (!user || user.role !== 'agency') {
      router.push('/login');
      return;
    }

    // Set agency name for sharing
    setAgencyName(user.agencyName || user.name || '');

    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyListings();
      
      if (response.success) {
        setListings(response.listings);
      } else {
        setError('Failed to load listings');
      }
    } catch (err: any) {
      handleListingError(err);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyUrl = async () => {
    try {
      // Create clean URL for the agency's public page with slug
      const agencySlug = slugUtils.generateSlug(agencyName);
      const cleanUrl = `${window.location.origin}/agency/${agencySlug}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(cleanUrl);
      
      toast.success('Agency URL copied to clipboard!');
      setShowShareModal(false);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL to clipboard');
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      const response = await apiClient.deleteListing(listingId);
      if (response.success) {
        toast.success('Listing deleted successfully!');
        setListings(listings.filter(listing => listing.id !== listingId));
      } else {
        toast.error('Failed to delete listing.');
      }
    } catch (err: any) {
      handleListingError(err);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || listing.type === filterType;
    
    // Price filtering
    const price = listing.price;
    const minPriceNum = minPrice ? parseInt(minPrice) : 0;
    const maxPriceNum = maxPrice ? parseInt(maxPrice) : Infinity;
    const matchesPrice = price >= minPriceNum && price <= maxPriceNum;
    
    return matchesSearch && matchesFilter && matchesPrice;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8 w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Agency Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your property listings and track your performance
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleShare}
                className="w-full sm:w-auto bg-gray-600 text-white px-4 py-3 sm:py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <Share className="w-5 h-5 mr-2" />
                Share
              </button>
              <button
                onClick={() => router.push('/dashboard/add-property')}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Property
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 lg:p-6 flex flex-col justify-center min-h-[80px] sm:min-h-0 sm:aspect-auto lg:aspect-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <Image 
                src="/roofchains-logo.png" 
                alt="RoofChains Logo" 
                width={32} 
                height={32} 
                className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 mb-1 sm:mb-0 sm:mr-2 lg:mr-3"
              />
              <div className="sm:ml-2 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Listings</p>
                <p className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-900">{listings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 lg:p-6 flex flex-col justify-center min-h-[80px] sm:min-h-0 sm:aspect-auto lg:aspect-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600 mb-1 sm:mb-0 sm:mr-2 lg:mr-3" />
              <div className="sm:ml-2 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">For Sale</p>
                <p className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {listings.filter(l => l.type === 'sale').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 lg:p-6 flex flex-col justify-center min-h-[80px] sm:min-h-0 sm:aspect-auto lg:aspect-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600 mb-1 sm:mb-0 sm:mr-2 lg:mr-3" />
              <div className="sm:ml-2 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">For Lease</p>
                <p className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {listings.filter(l => l.type === 'lease').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 lg:p-6 flex flex-col justify-center min-h-[80px] sm:min-h-0 sm:aspect-auto lg:aspect-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
              <Image 
                src="/roofchains-logo.png" 
                alt="RoofChains Logo" 
                width={32} 
                height={32} 
                className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 mb-1 sm:mb-0 sm:mr-2 lg:mr-3"
              />
              <div className="sm:ml-2 lg:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-900">{listings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search your listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'sale' | 'lease')}
              className="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="sale">For Sale</option>
              <option value="lease">For Lease</option>
            </select>
            
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <p className="text-sm text-gray-600">
              {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
            </p>
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Listings */}
        {error ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500">{error}</p>
            <button
              onClick={fetchListings}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {listings.length === 0 ? 'No listings yet' : 'No listings match your search'}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              {listings.length === 0 
                ? 'Start by adding your first property listing.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {listings.length === 0 && (
              <button
                onClick={() => router.push('/dashboard/add-property')}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Add Your First Property
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredListings.map((listing) => (
              <Link key={listing.id} href={`/dashboard/listings/${listing.id}`} className="block">
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  {/* Property Image */}
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={listing.images && listing.images.length > 0 
                        ? listing.images[0] 
                        : imageUtils.getPlaceholderImage(400, 300)
                      }
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        listing.type === 'sale' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {listing.type === 'sale' ? 'For Sale' : 'For Lease'}
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {listing.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {listing.description}
                    </p>

                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{listing.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{formatPrice(listing.price)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-xs">
                        <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span>{formatDate(listing.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Share URL Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Share className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Share Agency URL</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                Share this clean URL for your agency:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-sm font-mono text-gray-800 break-all">
                  {`${window.location.origin}/agency/${slugUtils.generateSlug(agencyName)}`}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyUrl}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 