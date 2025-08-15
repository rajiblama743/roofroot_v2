'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, DollarSign, Building2, Calendar } from 'lucide-react';
import { apiClient, Listing } from '@/lib/api';
import { formatPrice, formatDate, truncateText, imageUtils, slugUtils } from '@/lib/utils';

const FeaturedListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getListings({ 
          limit: 6,
          page: 1 
        });
        
        if (response.success) {
          setListings(response.listings || []);
        } else {
          setError('Failed to load featured listings');
        }
      } catch (err) {
        console.error('Error fetching featured listings:', err);
        setError('Failed to load featured listings');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-40 sm:h-48 bg-gray-200"></div>
            <div className="p-4 sm:p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-sm sm:text-base text-gray-500">{error}</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-sm sm:text-base text-gray-500">No featured listings available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/properties/${listing.id}`}
          className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          {/* Property Image */}
          <div className="relative h-40 sm:h-48 overflow-hidden">
            <img
              src={listing.images && listing.images.length > 0 
                ? listing.images[0] 
                : imageUtils.getPlaceholderImage(400, 300)
              }
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
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
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
              {truncateText(listing.title, 50)}
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm line-clamp-2">
              {truncateText(listing.description, 100)}
            </p>

            <div className="flex items-center text-gray-500 text-sm mb-3">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{truncateText(listing.location, 40)}</span>
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

            {/* Agency Info */}
            {listing.createdBy && (
              <div className="flex items-center justify-center sm:justify-start pt-3 border-t border-gray-100 min-h-[2rem] sm:min-h-0">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-2 flex-shrink-0" />
                <Link 
                  href={`/find-agency/${slugUtils.generateSlug(listing.createdBy.agencyName || listing.createdBy.name)}`}
                  className="text-xs sm:text-sm text-gray-500 line-clamp-1 hover:text-blue-600 transition-colors text-center sm:text-left flex items-center cursor-pointer z-10 relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (listing.createdBy) {
                      window.location.href = `/find-agency/${slugUtils.generateSlug(listing.createdBy.agencyName || listing.createdBy.name)}`;
                    }
                  }}
                >
                  {listing.createdBy.agencyName || listing.createdBy.name}
                </Link>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FeaturedListings; 