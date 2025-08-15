import Image from 'next/image';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Agency } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface AgencyCardProps {
  agency: Agency;
  onClick: (agencyName: string) => void;
}

export default function AgencyCard({ agency, onClick }: AgencyCardProps) {
  const handleClick = () => {
    onClick(agency.agencyName || agency.name || '');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-80 md:h-96 flex flex-col"
    >
      {/* Agency Header - 25% of card height */}
      <div className="h-1/4 flex items-center justify-center p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-center w-full h-full">
          <Image 
            src="/roofchains-logo.png" 
            alt="RoofChains Logo" 
            width={32} 
            height={32} 
            className="w-8 h-8 mr-3 flex-shrink-0"
          />
          <div className="text-center flex items-center">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {agency.agencyName || agency.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Agency Details - Main content area */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          {/* Description - Always show exactly 4 lines */}
          <div className="text-gray-600 text-sm mb-4 overflow-hidden" style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.4rem',
            maxHeight: '5.6rem',
            minHeight: '5.6rem'
          }}>
            {agency.agencyDescription || 'No description available'}
          </div>

          <div className="space-y-2">
            {agency.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{agency.email}</span>
              </div>
            )}
            {agency.phoneNumber && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{agency.phoneNumber}</span>
              </div>
            )}
            {agency.address && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{agency.address}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Member since {formatDate(agency.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Contact info - Fixed height */}
      <div className="h-12 flex items-center px-4 py-2 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{agency.email || 'Contact us'}</span>
        </div>
      </div>
    </div>
  );
}
