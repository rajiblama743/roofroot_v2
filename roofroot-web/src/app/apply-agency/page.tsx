'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building2, 
  ArrowLeft,
  FileText,
  CheckCircle
} from 'lucide-react';
import { authUtils, validationUtils } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AgencyApplicationData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  agencyName: string;
  agencyDescription: string;
  licenseNumber?: string;
  website?: string;
  experience: string;
  reason: string;
}

export default function ApplyAgencyPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgencyApplicationData>();

  const onSubmit = async (data: AgencyApplicationData) => {
    try {
      setLoading(true);
      
      // For now, we'll just show a success message
      // In a real application, this would send the application to admin for review
      console.log('Agency application submitted:', data);
      
      toast.success('Agency application submitted successfully! We will review your application and contact you soon.');
      setSubmitted(true);
      
    } catch (error: any) {
      console.error('Application error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Application Submitted!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Thank you for your interest in becoming a RoofRoot agency partner.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Application Received
                </h3>
                <p className="text-gray-600">
                  We have received your agency application and will review it within 2-3 business days. 
                  You will receive an email notification once your application has been processed.
                </p>
              </div>
              
              <div className="space-y-4">
                <Link
                  href="/"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Homepage
                </Link>
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Apply for Agency Status
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join RoofRoot as a verified real estate agency partner
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Application Process
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>• Submit your application with required information</p>
                  <p>• Our team will review within 2-3 business days</p>
                  <p>• You'll receive an email notification of the decision</p>
                  <p>• Approved agencies can start listing properties immediately</p>
                </div>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              
              {/* Name Field */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                    })}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Email is required',
                      validate: (value) => validationUtils.isValidEmail(value) || 'Please enter a valid email',
                    })}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="mb-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    {...register('phoneNumber', {
                      required: 'Phone number is required',
                      validate: (value) => {
                        if (!value) return 'Phone number is required';
                        return validationUtils.isValidPhone(value) || 'Please enter a valid phone number';
                      },
                    })}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-2 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Agency Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agency Information</h3>
              
              {/* Agency Name Field */}
              <div className="mb-4">
                <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700">
                  Agency Name *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="agencyName"
                    type="text"
                    {...register('agencyName', {
                      required: 'Agency name is required',
                      maxLength: {
                        value: 200,
                        message: 'Agency name must be less than 200 characters',
                      },
                    })}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.agencyName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your agency name"
                  />
                </div>
                {errors.agencyName && (
                  <p className="mt-2 text-sm text-red-600">{errors.agencyName.message}</p>
                )}
              </div>

              {/* Agency Description Field */}
              <div className="mb-4">
                <label htmlFor="agencyDescription" className="block text-sm font-medium text-gray-700">
                  Agency Description *
                </label>
                <textarea
                  id="agencyDescription"
                  rows={3}
                  {...register('agencyDescription', {
                    required: 'Agency description is required',
                    maxLength: {
                      value: 1000,
                      message: 'Description must be less than 1000 characters',
                    },
                  })}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.agencyDescription ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your agency services, specialties, and experience"
                />
                {errors.agencyDescription && (
                  <p className="mt-2 text-sm text-red-600">{errors.agencyDescription.message}</p>
                )}
              </div>

              {/* License Number Field */}
              <div className="mb-4">
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                  Real Estate License Number (Optional)
                </label>
                <input
                  id="licenseNumber"
                  type="text"
                  {...register('licenseNumber')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your license number if applicable"
                />
              </div>

              {/* Website Field */}
              <div className="mb-4">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website (Optional)
                </label>
                <input
                  id="website"
                  type="url"
                  {...register('website')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://your-agency-website.com"
                />
              </div>

              {/* Years of Experience Field */}
              <div className="mb-4">
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                  Years of Real Estate Experience *
                </label>
                <select
                  id="experience"
                  {...register('experience', {
                    required: 'Please select your experience level',
                  })}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.experience ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select experience level</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
                {errors.experience && (
                  <p className="mt-2 text-sm text-red-600">{errors.experience.message}</p>
                )}
              </div>

              {/* Reason for Application Field */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Why do you want to join RoofRoot? *
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  {...register('reason', {
                    required: 'Please tell us why you want to join RoofRoot',
                    maxLength: {
                      value: 500,
                      message: 'Response must be less than 500 characters',
                    },
                  })}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.reason ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Tell us about your goals and how you plan to use RoofRoot"
                />
                {errors.reason && (
                  <p className="mt-2 text-sm text-red-600">{errors.reason.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting application...
                  </div>
                ) : (
                  'Submit Agency Application'
                )}
              </button>
            </div>
          </form>

          {/* Back to Register */}
          <div className="mt-6 text-center">
            <Link
              href="/register"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to customer registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 