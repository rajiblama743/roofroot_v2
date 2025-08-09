'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { withAdminGuard } from '@/components/withAdminGuard';
import AdminLayout from '@/components/AdminLayout';
import Table from '@/components/Table';
import SearchBar from '@/components/SearchBar';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface PendingAgency {
  _id: string;
  name: string;
  email: string;
  role: 'agency';
  status: 'pending';
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
  license?: string;
  address?: string;
  createdAt: string;
}

function RequestsPage() {
  const router = useRouter();
  const [pendingAgencies, setPendingAgencies] = useState<PendingAgency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<PendingAgency[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingAgencies();
  }, []);

  useEffect(() => {
    // Filter agencies based on search term
    const filtered = pendingAgencies.filter(agency =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agency.agencyName && agency.agencyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (agency.address && agency.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredAgencies(filtered);
  }, [pendingAgencies, searchTerm]);

  const fetchPendingAgencies = async () => {
    try {
      const response = await api.getUsers();
      const allUsers = response.users || [];
      const pendingAgencyUsers = allUsers.filter((user: any) => 
        user.role === 'agency' && user.status === 'pending'
      );
      setPendingAgencies(pendingAgencyUsers);
    } catch (error) {
      console.error('Error fetching pending agencies:', error);
      toast.error('Failed to load pending agencies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'pending') => {
    try {
      setUpdatingStatus(userId);
      await api.updateUserStatus(userId, { status: newStatus });
      
      if (newStatus === 'active') {
        toast.success('Agency approved successfully');
      } else {
        toast.success('Agency status updated');
      }
      
      // Refresh the list
      fetchPendingAgencies();
    } catch (error) {
      console.error('Error updating agency status:', error);
      toast.error('Failed to update agency status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'agencyName', label: 'Agency Name' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'address', label: 'Address' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'createdAt',
      label: 'Requested',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: PendingAgency) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusUpdate(row._id, 'active')}
            disabled={updatingStatus === row._id}
            className="text-green-600 hover:text-green-900 disabled:opacity-50"
            title="Approve Agency"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/agencies/${row._id}`)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Agency Requests</h1>
            <p className="mt-2 text-sm text-gray-700">
              Review and approve pending agency applications
            </p>
          </div>
        </div>

        <div className="mt-6">
          <SearchBar
            placeholder="Search pending agencies..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-md"
            id="requests-search"
            name="requestsSearch"
          />
        </div>

        <div className="mt-6">
          <Table
            columns={columns}
            data={filteredAgencies}
            className="mt-4"
          />
        </div>

        {filteredAgencies.length === 0 && !isLoading && (
          <div className="mt-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              All agency applications have been processed.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdminGuard(RequestsPage);
