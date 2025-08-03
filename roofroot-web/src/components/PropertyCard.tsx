'use client';

import Link from 'next/link';
import { MapPin, DollarSign, Calendar, Building2 } from 'lucide-react';
import { Listing } from '@/lib/api';
import { formatPrice, formatDate, imageUtils } from '@/lib/utils';

interface PropertyCardProps {
  listing: Listing;
  viewMode: 'grid' | 'list';
}

export default function PropertyCard({ listing, viewMode }: PropertyCardProps) {
  if (viewMode === 'list') {
    return (
      <Link href={`/properties/${listing.id}`} className="block">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 h-32 sm:h-32 flex-shrink-0">
              <img
                src={listing.images && listing.images.length > 0 
                  ? listing.images[0] 
                  : imageUtils.getPlaceholderImage(400, 300)
                }
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">
                  {listing.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold self-start ${
                  listing.type === 'sale' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {listing.type === 'sale' ? 'For Sale' : 'For Lease'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {listing.description}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{listing.location}</span>
                </div>
                
                <div className="flex items-center text-green-600 font-semibold">
                  <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{formatPrice(listing.price)}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3">
                <div className="flex items-center text-gray-500 text-xs">
                  <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span>{formatDate(listing.createdAt)}</span>
                </div>
                
                {listing.createdBy && (
                  <div className="flex items-center text-gray-500 text-xs">
                    <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{listing.createdBy.agencyName || listing.createdBy.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/properties/${listing.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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

          {listing.createdBy && (
            <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
              <Building2 className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="text-xs text-gray-500 line-clamp-1">
                {listing.createdBy.agencyName || listing.createdBy.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 