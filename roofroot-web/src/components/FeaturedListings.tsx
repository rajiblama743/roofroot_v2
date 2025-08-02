'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, DollarSign, Building2, Calendar } from 'lucide-react';
import { apiClient, Listing } from '@/lib/api';
import { formatPrice, formatDate, truncateText, imageUtils } from '@/lib/utils';

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
          setListings(response.listings);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
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
      <div className="text-center py-12">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No featured listings available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/properties/${listing.id}`}
          className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          {/* Property Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={listing.images && listing.images.length > 0 
                ? listing.images[0] 
                : imageUtils.getPlaceholderImage(400, 300)
              }
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                listing.type === 'sale' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {listing.type === 'sale' ? 'For Sale' : 'For Lease'}
              </span>
            </div>
          </div>

          {/* Property Details */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {truncateText(listing.title, 50)}
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm">
              {truncateText(listing.description, 100)}
            </p>

            <div className="flex items-center text-gray-500 text-sm mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{truncateText(listing.location, 40)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600 font-semibold">
                <DollarSign className="w-4 h-4 mr-1" />
                <span>{formatPrice(listing.price)}</span>
              </div>
              
              <div className="flex items-center text-gray-500 text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatDate(listing.createdAt)}</span>
              </div>
            </div>

            {/* Agency Info */}
            {listing.createdBy && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  <span>{listing.createdBy.agencyName || listing.createdBy.name}</span>
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FeaturedListings; 