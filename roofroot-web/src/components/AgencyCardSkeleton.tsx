import { Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function AgencyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow animate-pulse">
      <div className="p-6">
        {/* Header with logo and name skeleton */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Contact info skeleton */}
        <div className="space-y-2">
          {/* Email skeleton */}
          <div className="flex items-center text-sm">
            <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-gray-300" />
            <div className="h-3 bg-gray-200 rounded w-40"></div>
          </div>
          
          {/* Phone skeleton */}
          <div className="flex items-center text-sm">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-gray-300" />
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          
          {/* Address skeleton */}
          <div className="flex items-start text-sm">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-gray-300 mt-0.5" />
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-36"></div>
              <div className="h-3 bg-gray-200 rounded w-28"></div>
            </div>
          </div>
          
          {/* Member since skeleton */}
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-gray-300" />
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
