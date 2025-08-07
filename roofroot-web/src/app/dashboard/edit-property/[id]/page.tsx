'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, X, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { apiClient } from '@/lib/api';
import { handleListingError } from '@/lib/errorHandler';

interface ListingData {
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
  };
}

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<ListingData | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'sale' | 'lease'>('sale');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [carBay, setCarBay] = useState('');
  const [area, setArea] = useState('');
  const [images, setImages] = useState('');

  // Get user from localStorage
  const getUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  };

  // Get auth token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch listing data
  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = getUser();
      if (!user || user.role !== 'agency') {
        router.push('/login');
        return;
      }

      const data = await apiClient.getListing(params.id as string);

      if (data.success) {
        const listingData = data.listing;
        
        // Check if user owns this listing
        if (listingData.createdBy && listingData.createdBy._id !== user?._id) {
          toast.error('You can only edit your own listings');
          router.push('/dashboard');
          return;
        }

        setListing(listingData);
        
        // Set form values
        setTitle(listingData.title || '');
        setDescription(listingData.description || '');
        setPrice(listingData.price?.toString() || '');
        setType(listingData.type || 'sale');
        setLocation(listingData.location || '');
        setBedrooms(listingData.bedrooms?.toString() || '');
        setBathrooms(listingData.bathrooms?.toString() || '');
        setCarBay(listingData.carBay?.toString() || '');
        setArea(listingData.area?.toString() || '');
        setImages(listingData.images?.join('\n') || '');
      } else {
        setError('Listing not found');
      }
    } catch (error: any) {
      console.error('Error fetching listing:', error);
      handleListingError(error);
      setError('Failed to load listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'agency') {
      router.push('/login');
      return;
    }

    fetchListing();
  }, [params.id, router]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (error && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        fetchListing();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, retryCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim() || !description.trim() || !location.trim() || !price.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setSubmitting(true);
    
    try {
      // Process images field - split by newlines and filter empty lines
      let imagesArray: string[] = [];
      if (images.trim()) {
        imagesArray = images
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0)
          .slice(0, 10); // Limit to 10 images
      }

      const formData = {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        type,
        location: location.trim(),
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        carBay: carBay ? parseInt(carBay) : undefined,
        area: area ? parseFloat(area) : undefined,
        images: imagesArray.length > 0 ? imagesArray : undefined
      };

      const data = await apiClient.updateListing(params.id as string, formData);

      if (data.success) {
        toast.success('Listing updated successfully');
        router.push(`/dashboard/listings/${params.id}`);
      } else {
        toast.error(data.message || 'Failed to update listing');
      }
    } catch (error: any) {
      console.error('Error updating listing:', error);
      handleListingError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8 w-1/3"></div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-4 sm:mb-6 px-2 sm:px-1">
            <Breadcrumbs
              items={[
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'My Listings', href: '/dashboard' },
                { name: 'Error' }
              ]}
            />
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error || 'The listing you are looking for does not exist.'}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setError(null);
                  setRetryCount(0);
                  fetchListing();
                }}
                disabled={!isOnline}
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wifi className="w-5 h-5 mr-2" />
                {!isOnline ? 'Waiting for connection...' : 'Try Again'}
              </button>
              
              <Link
                href="/dashboard"
                className="inline-flex items-center bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-4 sm:mb-6 px-2 sm:px-1">
          <Breadcrumbs
            items={[
              { name: 'Dashboard', href: '/dashboard' },
              { name: 'My Listings', href: '/dashboard' },
              { name: listing?.title || 'Listing Details', href: `/dashboard/listings/${params.id}` },
              { name: 'Edit Property' }
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left">Edit Property</h1>
            
            {/* Network Status Indicator */}
            <div className="flex items-center gap-2">
              {!isOnline && (
                <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  <WifiOff className="w-4 h-4" />
                  <span>Offline</span>
                </div>
              )}
              {isOnline && retryCount > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <Wifi className="w-4 h-4" />
                  <span>Back Online</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter property title"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as 'sale' | 'lease')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="sale">For Sale</option>
                  <option value="lease">For Lease</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter property location"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter property description"
                required
              />
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of bedrooms"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of bathrooms"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="carBay" className="block text-sm font-medium text-gray-700 mb-2">
                  Car Bay
                </label>
                <input
                  id="carBay"
                  name="carBay"
                  type="number"
                  value={carBay}
                  onChange={(e) => setCarBay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of car bays"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sq ft)
                </label>
                <input
                  id="area"
                  name="area"
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Property area"
                  min="0"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                Image URLs (Optional)
              </label>
              <textarea
                id="images"
                name="images"
                value={images}
                onChange={(e) => setImages(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter image URLs, one per line (max 10 images)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter image URLs, one per line. Maximum 10 images allowed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href={`/dashboard/listings/${params.id}`}
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 