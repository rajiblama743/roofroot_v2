'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Star } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/utils';

interface Agency {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
  role: string;
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getUsers();
        
        if (response.success) {
          // Filter only agency users
          const agencyUsers = response.users.filter((user: Agency) => user.role === 'agency');
          setAgencies(agencyUsers);
        } else {
          setError('Failed to load agencies');
        }
      } catch (err) {
        console.error('Error fetching agencies:', err);
        setError('Failed to load agencies');
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verified Agencies
          </h1>
          <p className="text-gray-600">
            Connect with trusted real estate agencies on RoofRoot
          </p>
        </div>

        {/* Results */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{error}</p>
          </div>
        ) : agencies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No agencies available yet
            </h3>
            <p className="text-gray-500">
              We're working on onboarding verified agencies. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencies.map((agency) => (
              <div key={agency._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {agency.agencyName || agency.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Verified Agency
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium ml-1">Verified</span>
                  </div>
                </div>

                {agency.agencyDescription && (
                  <p className="text-gray-600 text-sm mb-4">
                    {agency.agencyDescription}
                  </p>
                )}

                <div className="space-y-2">
                  {agency.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{agency.email}</span>
                    </div>
                  )}
                  
                  {agency.phoneNumber && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{agency.phoneNumber}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    Contact Agency
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Apply for Agency CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Want to become a RoofRoot Agency?
          </h2>
          <p className="text-blue-100 mb-6">
            Join our network of verified real estate agencies and start listing properties today.
          </p>
          <a
            href="/apply-agency"
            className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Apply for Agency Status
            <Building2 className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
} 