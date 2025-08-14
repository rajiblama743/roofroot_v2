'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Building2, MapPin, DollarSign, Bed, Bath, Calendar } from 'lucide-react';
import AgencyLayout from '@/components/AgencyLayout';
import { Breadcrumbs, ConfirmDialog } from '@/components/shared';
import { withAgencyGuard } from '@/components/withAgencyGuard';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  type: 'sale' | 'lease';
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

function AgencyListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (listingId) {
      console.log('useEffect triggered, listingId:', listingId);
      console.log('Checking authentication...');
      const token = sessionStorage.getItem('accessToken');
      const user = sessionStorage.getItem('user');
      console.log('Token exists:', !!token);
      console.log('User data exists:', !!user);
      if (user) {
        console.log('User data:', JSON.parse(user));
      }
      fetchListing();
    }
  }, [listingId]);

  const fetchListing = async () => {
    try {
      // For agency users, get their own listings and find the specific one
      const response = await apiClient.getMyListings();
      
      if (response.success && response.listings) {
        const foundListing = response.listings.find((listing: any) => listing._id === listingId);
        
        if (foundListing) {
          setListing(foundListing);
        } else {
          console.error('Listing not found in agency listings');
          toast.error('Listing not found or access denied');
          router.push('/agency/listings');
        }
      } else {
        console.error('API returned success: false, message:', response.message);
        toast.error('Failed to load listings');
        router.push('/agency/listings');
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
      router.push('/agency/listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async () => {
    console.log('handleDeleteListing called with listing:', listing);
    if (!listing) return;

    try {
      console.log('Calling apiClient.deleteListing with ID:', listing._id);
      const response = await apiClient.deleteListing(listing._id);
      console.log('Delete response:', response);
      if (response.success) {
        toast.success('Listing deleted successfully');
        router.push('/agency/listings');
      } else {
        toast.error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      sale: 'bg-green-100 text-green-800',
      lease: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {type === 'sale' ? 'For Sale' : 'For Rent'}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'active'}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <AgencyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AgencyLayout>
    );
  }

  if (!listing) {
    return (
      <AgencyLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Listing not found</p>
        </div>
      </AgencyLayout>
    );
  }


  
  return (
    <AgencyLayout>
      <div>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Agency', href: '/agency' },
            { label: 'Listings', href: '/agency/listings' },
            { label: listing.title }
          ]}
          className="mb-6"
        />

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{listing.title}</h1>
            <p className="mt-2 text-sm text-gray-700">
              {listing.location}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/agency/listings/${listing._id}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {getTypeBadge(listing.type)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {getStatusBadge(listing.status || 'active')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-semibold">
                      {formatPrice(listing.price)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {listing.location}
                    </dd>
                  </div>
                  {listing.bedrooms && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Bedrooms</dt>
                      <dd className="mt-1 text-sm text-gray-900">{listing.bedrooms}</dd>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Bathrooms</dt>
                      <dd className="mt-1 text-sm text-gray-900">{listing.bathrooms}</dd>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Description
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Listing Details */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Listing Details
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(listing.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Listing ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">
                      {listing._id}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteListing}
          title="Delete Listing"
          message={`Are you sure you want to delete "${listing.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AgencyLayout>
  );
}

export default withAgencyGuard(AgencyListingDetailPage);
