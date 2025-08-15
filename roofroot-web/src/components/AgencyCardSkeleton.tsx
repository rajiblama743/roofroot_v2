import { Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function AgencyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow animate-pulse h-80 md:h-96 flex flex-col">
      {/* Header with logo and name skeleton */}
      <div className="h-1/4 flex items-center justify-center p-2 sm:p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded mr-2 sm:mr-3"></div>
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-24 sm:w-32"></div>
        </div>
      </div>

      {/* Description skeleton */}
      <div className="flex-1 p-2 sm:p-4 flex flex-col justify-between">
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Contact info skeleton */}
        <div className="space-y-2">
          {/* Email skeleton */}
          <div className="flex items-center text-xs sm:text-sm">
            <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0 text-gray-300" />
            <div className="h-3 bg-gray-200 rounded w-32 sm:w-40"></div>
          </div>
          
          {/* Phone skeleton */}
          <div className="flex items-center text-xs sm:text-sm">
            <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0 text-gray-300" />
            <div className="h-3 bg-gray-200 rounded w-20 sm:w-24"></div>
          </div>
          
          {/* Address skeleton */}
          <div className="flex items-start text-xs sm:text-sm">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0 text-gray-300 mt-0.5" />
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-28 sm:w-36"></div>
              <div className="h-3 bg-gray-200 rounded w-20 sm:w-28"></div>
            </div>
          </div>
          
          {/* Member since skeleton */}
          <div className="flex items-center text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0 text-gray-300" />
            <div className="h-3 bg-gray-200 rounded w-24 sm:w-32"></div>
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="h-12 flex items-center px-2 sm:px-4 py-2 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center text-xs sm:text-sm">
          <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0 text-gray-300" />
          <div className="h-3 bg-gray-200 rounded w-20 sm:w-24"></div>
        </div>
      </div>
    </div>
  );
}
