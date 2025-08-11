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
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Image 
            src="/roofchains-logo.png" 
            alt="RoofChains Logo" 
            width={32} 
            height={32} 
            className="w-8 h-8 mr-3"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {agency.agencyName || agency.name}
            </h3>
          </div>
        </div>

        {agency.agencyDescription && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {agency.agencyDescription}
          </p>
        )}

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
            <div className="flex items-start text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{agency.address}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Member since {formatDate(agency.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
