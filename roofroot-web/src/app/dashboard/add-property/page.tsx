'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, X } from 'lucide-react';
import { apiClient } from '@/lib/api';

import { handleListingError } from '@/lib/errorHandler';

interface CreateListingForm {
  title: string;
  description: string;
  price: number;
  type: 'sale' | 'lease';
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  carBay?: number;
  area?: number;
  images?: string;
}

export default function AddPropertyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateListingForm>({
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      type: 'sale',
      location: '',
      bedrooms: 0,
      bathrooms: 0,
      carBay: 0,
      area: 0,
      images: ''
    }
  });

  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  useEffect(() => {
    // Check if user is logged in and is an agency
    if (!user || user.role !== 'agency') {
      toast.error('Only agency accounts can create properties. Please contact admin to upgrade your account.');
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  const onSubmit = async (data: CreateListingForm) => {
    setSubmitting(true);
    
    try {
      // Process images field - split by newlines and filter empty lines
      let images: string[] = [];
      if (data.images) {
        images = data.images
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0)
          .slice(0, 10); // Limit to 10 images
      }

      // Transform the data to ensure proper types
      const transformedData = {
        ...data,
        price: Number(data.price),
        bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
        carBay: data.carBay ? Number(data.carBay) : undefined,
        area: data.area ? Number(data.area) : undefined,
        images: images.length > 0 ? images : undefined,
      };
      
      const response = await apiClient.createListing(transformedData);
      
      if (response.success) {
        toast.success('Property created successfully');
        router.push('/dashboard');
      } else {
        console.error('API returned error:', response);
        toast.error(response.message || 'Failed to create property');
      }
    } catch (error: any) {
      handleListingError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">Add New Property</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter property title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  {...register('type', { required: 'Type is required' })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sale">For Sale</option>
                  <option value="lease">For Lease</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                {...register('location', { required: 'Location is required' })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter property location"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter property description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  {...register('bedrooms', { 
                    min: { value: 0, message: 'Bedrooms must be positive' }
                  })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of bedrooms"
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  {...register('bathrooms', { 
                    min: { value: 0, message: 'Bathrooms must be positive' }
                  })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of bathrooms"
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Car Bay
                </label>
                <input
                  type="number"
                  {...register('carBay', { 
                    min: { value: 0, message: 'Car Bay must be positive' }
                  })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of car bays"
                />
                {errors.carBay && (
                  <p className="mt-1 text-sm text-red-600">{errors.carBay.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area (sq ft)
              </label>
              <input
                type="number"
                {...register('area', { 
                  min: { value: 0, message: 'Area must be positive' }
                })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Property area"
              />
              {errors.area && (
                <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URLs (Optional)
              </label>
              <textarea
                {...register('images')}
                rows={3}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter image URLs, one per line (max 10 images)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter image URLs, one per line. Maximum 10 images allowed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {submitting ? 'Creating...' : 'Create Property'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 