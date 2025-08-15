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
    // Safety check: ensure listing.id exists
    if (!listing.id) {
      return null; // Don't render if no ID
    }
    
    return (
      <Link 
        href={fromAgency 
          ? `/properties/${listing.id}?fromAgency=true&agency=${encodeURIComponent(fromAgency)}`
          : `/properties/${listing.id}`
        } 
        className="block"
      >
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-80 md:h-96 flex flex-col">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 flex-shrink-0 relative overflow-hidden" style={{ height: '35%', minHeight: '112px' }}>
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
                <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[3.5rem]">
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
              
              <p className="text-gray-600 text-sm mb-3 overflow-hidden flex-1" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.4rem',
                maxHeight: '4.2rem'
              }}>
                {listing.description}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{listing.location}</span>
                </div>
                
                <div className="flex items-center text-green-600 font-semibold">
                  <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{formatPrice(listing.price)}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3">
                <div className="flex items-center text-gray-500 text-xs">
                  <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span>{formatDate(listing.createdAt)}</span>
                </div>
                
                {listing.createdBy && (
                  <div className="flex items-center text-gray-500 text-sm">
                    <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    <Link 
                      href={`/find-agency/${slugUtils.generateSlug(listing.createdBy.agencyName || listing.createdBy.name)}`}
                      className="hover:text-blue-600 transition-colors cursor-pointer z-10 relative truncate"
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
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Safety check: ensure listing.id exists
  if (!listing.id) {
    return null; // Don't render if no ID
  }
  
  return (
    <Link 
      href={fromAgency 
        ? `/properties/${listing.id}?fromAgency=true&agency=${encodeURIComponent(fromAgency)}`
        : `/properties/${listing.id}`
      } 
      className="block"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-80 md:h-96 flex flex-col">
        {/* Property Image - 35% of card height */}
        <div className="relative w-full overflow-hidden" style={{ height: '35%', minHeight: '112px' }}>
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
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
          <div>
            {/* Title - Exactly 2 lines reserved */}
            <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
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
      </div>
    </Link>
  );
} 