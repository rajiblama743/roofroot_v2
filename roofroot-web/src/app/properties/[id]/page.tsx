'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, MapPin, DollarSign, Calendar, Building2, Bed, Bath, Square, Edit, Trash2, Car, Home } from 'lucide-react';
import { apiClient, Listing } from '@/lib/api';
import { formatPrice, formatDate, imageUtils, slugUtils } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const [isFromDashboard, setIsFromDashboard] = useState(false);
  const [isFromAgency, setIsFromAgency] = useState(false);
  const [agencyName, setAgencyName] = useState<string | null>(null);

  useEffect(() => {
    // Check if user came from dashboard
    const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null');
    setIsFromDashboard(currentUser?.role === 'agency');
    
    // Check if we came from an agency page
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      const urlParams = new URLSearchParams(window.location.search);
      const fromAgency = urlParams.get('fromAgency');
      const agency = urlParams.get('agency');
      
      if (fromAgency === 'true' && agency) {
        setIsFromAgency(true);
        setAgencyName(decodeURIComponent(agency));
      } else if (referrer.includes('/agency/')) {
        setIsFromAgency(true);
        // Extract agency name from referrer URL
        const agencyMatch = referrer.match(/\/agency\/([^\/\?]+)/);
        if (agencyMatch) {
          setAgencyName(decodeURIComponent(agencyMatch[1]));
        }
      }
    }
  }, []);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching listing with ID:', params.id);
        const response = await apiClient.getListing(params.id as string);
        
        console.log('API Response:', response);
        
        if (response.success && response.listing) {
          setListing(response.listing);
        } else {
          console.error('API returned error:', response);
          setError(response.message || 'Failed to load property details');
        }
      } catch (err: any) {
        console.error('Error fetching listing:', err);
        
        // Handle specific error cases
        if (err.response?.status === 404) {
          setError('Property not found. The listing may have been removed or does not exist.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Failed to load property details. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  const handleDeleteListing = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const response = await apiClient.deleteListing(params.id as string);
      
      if (response.success) {
        toast.success('Listing deleted successfully');
        router.push('/dashboard');
      } else {
        toast.error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const isOwner = user && listing && (
    user.role === 'agency' && 
    listing.agency && 
    listing.agency._id === user._id
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8 w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
            <Link
              href={isFromDashboard ? "/dashboard" : "/properties"}
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to {isFromDashboard ? "Dashboard" : "Properties"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-4 sm:mb-6 px-2 sm:px-1">
          <Breadcrumbs
            items={
              isFromAgency && agencyName
                ? [
                    { name: 'Home', href: '/' },
                    { name: agencyName, href: `/agency/${slugUtils.generateSlug(agencyName)}` },
                    { name: listing?.title || 'Property Details' }
                  ]
                : [
                    { name: 'Home', href: '/' },
                    { name: 'Listings', href: '/properties' },
                    { name: listing?.title || 'Property Details' }
                  ]
            }
          />
        </div>



        {/* Property Images */}
        <div className="mb-8">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img
              src={listing.images && listing.images.length > 0 
                ? listing.images[selectedImageIndex] 
                : imageUtils.getPlaceholderImage(800, 400)
              }
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                listing.type === 'sale' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {listing.type === 'sale' ? 'For Sale' : 'For Lease'}
              </span>
            </div>
          </div>
          
          {/* Image Gallery Thumbnails */}
          {listing.images && listing.images.length > 1 && (
            <div className="mt-4 flex space-x-2 overflow-x-auto">
              {listing.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${listing.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left">{listing.title}</h1>
                
                {/* Edit/Delete buttons for owners */}
                {isOwner && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/edit-property/${listing.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteListing}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-lg font-medium">{listing.location}</span>
              </div>

              <div className="flex items-center text-green-600 font-bold text-2xl mb-6">
                <DollarSign className="w-6 h-6 mr-2" />
                <span>{formatPrice(listing.price)}</span>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>
            </div>

            {/* Property Features */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Bedrooms */}
                <div className="flex items-center">
                  <Bed className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="text-gray-700 font-medium">{listing.bedrooms || '-'}</p>
                  </div>
                </div>
                
                {/* Bathrooms */}
                <div className="flex items-center">
                  <Bath className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="text-gray-700 font-medium">{listing.bathrooms || '-'}</p>
                  </div>
                </div>
                
                {/* Car Bay */}
                <div className="flex items-center">
                  <Car className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Car Bay</p>
                    <p className="text-gray-700 font-medium">{listing.carBay || '-'}</p>
                  </div>
                </div>
                
                {/* Size */}
                <div className="flex items-center">
                  <Square className="w-5 h-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Size</p>
                    <p className="text-gray-700 font-medium">{listing.area ? `${listing.area} sq ft` : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{listing.type === 'sale' ? 'For Sale' : 'For Lease'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium text-green-600">{formatPrice(listing.price)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-medium">{formatDate(listing.createdAt)}</span>
                </div>
              </div>

              {/* Location with improved styling */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">Location</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{listing.location}</p>
                  </div>
                </div>
              </div>

              {/* Agency Information */}
              {listing.createdBy && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Listed by</h4>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border">
                      <Image 
                        src="/roofchains-logo.png" 
                        alt="RoofChains Logo" 
                        width={20} 
                        height={20} 
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="ml-3">
                      <Link 
                        href={`/agency/${slugUtils.generateSlug(listing.createdBy.agencyName || listing.createdBy.name)}`}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {listing.createdBy.agencyName || listing.createdBy.name}
                      </Link>
                      <p className="text-xs text-gray-500">Verified Agency</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Agency Button - Only show for non-agency users */}
              {(!user || user.role !== 'agency') && (
                <div className="mt-6">
                  <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Contact Agency
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 