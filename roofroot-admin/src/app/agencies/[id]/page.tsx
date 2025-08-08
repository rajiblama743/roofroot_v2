'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, CheckCircle, Clock } from 'lucide-react';
import { withAdminGuard } from '@/components/withAdminGuard';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface Agency {
  _id: string;
  name: string;
  email: string;
  role: 'agency';
  status: 'active' | 'pending';
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
  license?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

function AgencyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchAgency(params.id as string);
    }
  }, [params.id]);

  const fetchAgency = async (id: string) => {
    try {
      const response = await api.getUser(id);
      setAgency(response.user);
    } catch (error) {
      console.error('Error fetching agency:', error);
      toast.error('Failed to load agency details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'active' | 'pending') => {
    if (!agency) return;

    try {
      setUpdatingStatus(true);
      await api.updateUserStatus(agency._id, { status: newStatus });
      
      toast.success('Agency status updated successfully');
      
      // Refresh the agency data
      fetchAgency(agency._id);
    } catch (error) {
      console.error('Error updating agency status:', error);
      toast.error('Failed to update agency status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4 mr-2" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-4 w-4 mr-2" />
          Pending
        </span>
      );
    }
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

  if (!agency) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Agency not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The agency you're looking for doesn't exist.
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
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {agency.agencyName || agency.name}
              </h1>
              <p className="text-sm text-gray-600">Agency Details</p>
            </div>
          </div>
          
          {/* Status Toggle */}
          <div className="flex items-center space-x-4">
            {getStatusBadge(agency.status)}
            <button
              onClick={() => handleStatusUpdate(agency.status === 'active' ? 'pending' : 'active')}
              disabled={updatingStatus}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                agency.status === 'active'
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              } disabled:opacity-50`}
            >
              {updatingStatus ? 'Updating...' : agency.status === 'active' ? 'Set to Pending' : 'Approve Agency'}
            </button>
          </div>
        </div>

        {/* Agency Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
          </div>
          
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{agency.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{agency.email}</p>
                </div>
              </div>
              
              {agency.phoneNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="mt-1 flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{agency.phoneNumber}</p>
                  </div>
                </div>
              )}
              
              {agency.agencyName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Agency Name</label>
                  <p className="mt-1 text-sm text-gray-900">{agency.agencyName}</p>
                </div>
              )}
              
              {agency.license && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">License</label>
                  <p className="mt-1 text-sm text-gray-900">{agency.license}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                <div className="mt-1 flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">
                    {new Date(agency.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            {agency.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <div className="mt-1 flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-900">{agency.address}</p>
                </div>
              </div>
            )}
            
            {agency.agencyDescription && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{agency.agencyDescription}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAdminGuard(AgencyDetailPage);
