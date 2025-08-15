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
          limit: 10, // Fetch more listings to have a better selection for randomization
          page: 1 
        });
        
        if (response.success) {
          const allListings = response.listings || [];
          // Randomly select 3 properties
          const shuffled = [...allListings].sort(() => 0.5 - Math.random());
          const randomListings = shuffled.slice(0, 3);
          setListings(randomListings);
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
        {[1, 2, 3].map((i) => (
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
          className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-80 md:h-96 flex flex-col"
        >
          {/* Property Image - 35% of card height */}
          <div className="relative w-full overflow-hidden" style={{ height: '35%', minHeight: '112px' }}>
            <img
              src={listing.images && listing.images.length > 0 
                ? listing.images[0] 
                : imageUtils.getPlaceholderImage(400, 300)
              }
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2">
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                listing.type === 'sale' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {listing.type === 'sale' ? 'For Sale' : 'For Lease'}
              </span>
            </div>
          </div>

          {/* Property Details - Main content area */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            {/* Title - Exactly 2 lines reserved */}
            <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
              {listing.title}
            </h3>
            
            {/* Description - 3 lines max with explicit height */}
            <p className="text-gray-600 text-sm mb-3 overflow-hidden" style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.4rem',
              maxHeight: '4.2rem'
            }}>
              {listing.description}
          </p>

            {/* Address - 1 line only */}
            <div className="flex items-center text-gray-500 text-sm mb-3">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>

            {/* Price & Date - Unchanged */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-green-600 font-semibold">
                <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{formatPrice(listing.price)}</span>
              </div>
              
              <div className="flex items-center text-gray-500 text-xs">
                <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>{formatDate(listing.createdAt)}</span>
              </div>
            </div>

          </div>

        {/* Footer - Agency name + link - Fixed height at bottom */}
        {listing.createdBy && (
          <div className="h-12 flex items-center px-4 py-2 border-t border-gray-100 bg-gray-50">
            <Building2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <Link 
              href={`/find-agency/${slugUtils.generateSlug(listing.createdBy.agencyName || listing.createdBy.name)}`}
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors truncate"
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
        </Link>
      ))}
    </div>
  );
};

export default FeaturedListings; 