'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, DollarSign, Calendar, Building2 } from 'lucide-react';
import { Listing } from '@/lib/api';
import { formatPrice, formatDate, imageUtils, slugUtils } from '@/lib/utils';
import { useState } from 'react';

interface PropertyCardProps {
  listing: Listing;
  viewMode: 'grid' | 'list';
  fromAgency?: string;
}

export default function PropertyCard({ listing, viewMode, fromAgency }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get the image source with fallback
  const getImageSrc = () => {
    if (imageError || !listing.images || listing.images.length === 0) {
      return imageUtils.getPlaceholderImage(400, 300);
    }
    return listing.images[0];
  };

  const handleImageError = () => {
    console.warn(`Failed to load image for listing: ${listing.title}`);
    setImageError(true);
  };

  // Get placeholder image for blur effect
  const getBlurDataURL = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
  };

  if (viewMode === 'list') {
    return (
      <Link 
        href={fromAgency 
          ? `/properties/${listing.id}?fromAgency=true&agency=${encodeURIComponent(fromAgency)}`
          : `/properties/${listing.id}`
        } 
        className="block"
      >
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 h-32 sm:h-32 flex-shrink-0 relative overflow-hidden">
              <Image
                src={getImageSrc()}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 192px"
                loading="lazy"
                onError={handleImageError}
                placeholder="blur"
                blurDataURL={getBlurDataURL()}
              />
            </div>
            <div className="flex-1 p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 line-clamp-1">
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
              
              <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                {listing.description}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{listing.location}</span>
                </div>
                
                <div className="flex items-center text-green-600 font-semibold">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  <span className="text-xs sm:text-sm lg:text-base">{formatPrice(listing.price)}</span>
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
                    <Link 
                      href={`/agency/${slugUtils.generateSlug(listing.createdBy.agencyName || listing.createdBy.name)}`}
                      className="line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer z-10 relative"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (listing.createdBy) {
                          window.location.href = `/agency/${slugUtils.generateSlug(listing.createdBy.agencyName || listing.createdBy.name)}`;
                        }
                      }}
                    >
                      {listing.createdBy.agencyName || listing.createdBy.name}
                    </Link>
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
    <Link 
      href={fromAgency 
        ? `/properties/${listing.id}?fromAgency=true&agency=${encodeURIComponent(fromAgency)}`
        : `/properties/${listing.id}`
      } 
      className="block"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Property Image */}
        <div className="relative h-32 sm:h-40 lg:h-48 overflow-hidden">
          <Image
            src={getImageSrc()}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
            onError={handleImageError}
            placeholder="blur"
            blurDataURL={getBlurDataURL()}
          />
          <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4">
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
        <div className="p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {listing.title}
          </h3>
          
          <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
            {listing.description}
          </p>

          <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-3">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{listing.location}</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-green-600 font-semibold">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="text-xs sm:text-sm lg:text-base">{formatPrice(listing.price)}</span>
            </div>
            
            <div className="flex items-center text-gray-500 text-xs">
              <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
              <span>{formatDate(listing.createdAt)}</span>
            </div>
          </div>

          {listing.createdBy && (
            <div className="flex items-center justify-center sm:justify-start pt-3 border-t border-gray-100 min-h-[2rem] sm:min-h-0">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-2 flex-shrink-0" />
              <Link 
                href={`/agency/${slugUtils.generateSlug(listing.createdBy.agencyName || listing.createdBy.name)}`}
                className="text-xs sm:text-sm text-gray-500 line-clamp-1 hover:text-blue-600 transition-colors text-center sm:text-left flex items-center cursor-pointer z-10 relative"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (listing.createdBy) {
                    window.location.href = `/agency/${slugUtils.generateSlug(listing.createdBy.agencyName || listing.createdBy.name)}`;
                  }
                }}
              >
                {listing.createdBy.agencyName || listing.createdBy.name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 