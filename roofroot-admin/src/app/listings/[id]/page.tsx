'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Home, DollarSign, MapPin, Calendar, User, Bed, Bath, Car } from 'lucide-react';
import { withAdminGuard } from '@/components/withAdminGuard';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface ListingDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  type: 'sale' | 'lease';
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  carBay?: number;
  area?: number;
  images?: string[];
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    agencyName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchListing(params.id as string);
    }
  }, [params.id]);

  const fetchListing = async (id: string) => {
    try {
      const response = await api.getListing(id);
      setListing(response.listing);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast.error('Failed to load listing details');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      sale: 'bg-green-100 text-green-800',
      lease: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatArea = (area?: number) => {
    if (!area) return 'N/A';
    return `${area} sq ft`;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!listing) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Listing not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The listing you're looking for doesn't exist.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <Home className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {listing.title}
                </h1>
                <p className="text-sm text-gray-600">Property Details</p>
              </div>
            </div>
          </div>
          
          {/* Type Badge */}
          <div className="flex items-center space-x-4">
            {getTypeBadge(listing.type)}
          </div>
        </div>

        {/* Property Images */}
        {listing.images && listing.images.length > 0 && (
          <div className="mb-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Images</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listing.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Property Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Property Information</h2>
          </div>
          
          <div className="px-6 py-4 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="mt-1 text-sm text-gray-900">{listing.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <div className="mt-1 flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900 font-semibold">{formatPrice(listing.price)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <div className="mt-1 flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-900">{listing.location}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <p className="mt-1 text-sm text-gray-900">{formatArea(listing.area)}</p>
              </div>
            </div>
            
            {/* Property Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Details</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{listing.bedrooms || 0} Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{listing.bathrooms || 0} Bathrooms</span>
                </div>
                <div className="flex items-center">
                  <Car className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{listing.carBay || 0} Car Bay</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{listing.description}</p>
            </div>
          </div>
        </div>

        {/* Creator Information */}
        {listing.createdBy && (
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Created By</h2>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{listing.createdBy.name}</p>
                  <p className="text-sm text-gray-500">{listing.createdBy.email}</p>
                  {listing.createdBy.agencyName && (
                    <p className="text-sm text-gray-500">{listing.createdBy.agencyName}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Timestamps</h2>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-500">{new Date(listing.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-500">{new Date(listing.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAdminGuard(ListingDetailPage);
