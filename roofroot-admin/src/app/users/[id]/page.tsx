'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Building2, Shield, UserCheck, CheckCircle, Clock } from 'lucide-react';
import { withAdminGuard } from '@/components/withAdminGuard';
import AdminLayout from '@/components/AdminLayout';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'agency' | 'customer';
  status: 'active' | 'pending';
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
  license?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchUser(params.id as string);
    }
  }, [params.id]);

  const fetchUser = async (id: string) => {
    try {
      const response = await api.getUser(id);
      setUser(response.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'active' | 'pending') => {
    if (!user) return;

    try {
      setUpdatingStatus(true);
      await api.updateUserStatus(user._id, { status: newStatus });
      
      if (newStatus === 'active') {
        toast.success('User approved successfully');
      } else {
        toast.success('User status updated');
      }
      
      // Refresh user data
      fetchUser(user._id);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      agency: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <UserCheck className="h-4 w-4 mr-2" />
          Active
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Calendar className="h-4 w-4 mr-2" />
          Pending
        </span>
      );
    }
    return null;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-6 w-6 text-red-600" />;
      case 'agency':
        return <Building2 className="h-6 w-6 text-blue-600" />;
      case 'customer':
        return <User className="h-6 w-6 text-green-600" />;
      default:
        return <User className="h-6 w-6 text-gray-600" />;
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

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The user you're looking for doesn't exist.
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
              {getRoleIcon(user.role)}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-sm text-gray-600">User Details</p>
              </div>
            </div>
          </div>
          
          {/* Status, Role, and Actions */}
          <div className="flex items-center space-x-4">
            {getStatusBadge(user.status)}
            {getRoleBadge(user.role)}
            
            {/* Show approval/status change buttons for agency users */}
            {user.role === 'agency' && (
              <div className="flex space-x-2">
                {user.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate('active')}
                    disabled={updatingStatus}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {updatingStatus ? 'Approving...' : 'Approve'}
                  </button>
                )}
                {user.status === 'active' && (
                  <button
                    onClick={() => handleStatusUpdate('pending')}
                    disabled={updatingStatus}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    {updatingStatus ? 'Updating...' : 'Set Pending'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
          </div>
          
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{user.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
              </div>
              
              {user.phoneNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="mt-1 flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{user.phoneNumber}</p>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                <div className="mt-1 flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Agency-specific information */}
            {user.role === 'agency' && (
              <>
                {user.agencyName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agency Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.agencyName}</p>
                  </div>
                )}
                
                {user.license && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">License</label>
                    <p className="mt-1 text-sm text-gray-900">{user.license}</p>
                  </div>
                )}
                
                {user.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <div className="mt-1 flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <p className="text-sm text-gray-900">{user.address}</p>
                    </div>
                  </div>
                )}
                
                {user.agencyDescription && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{user.agencyDescription}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAdminGuard(UserDetailPage);
