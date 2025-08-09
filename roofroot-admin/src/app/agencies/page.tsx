'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { withAdminGuard } from '@/components/withAdminGuard';
import AdminLayout from '@/components/AdminLayout';
import Table from '@/components/Table';
import SearchBar from '@/components/SearchBar';
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
}

function AgenciesPage() {
  const router = useRouter();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchAgencies();
  }, []);

  useEffect(() => {
    // Filter agencies based on search term
    const filtered = agencies.filter(agency =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agency.agencyName && agency.agencyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (agency.address && agency.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredAgencies(filtered);
  }, [agencies, searchTerm]);

  const fetchAgencies = async () => {
    try {
      const response = await api.getUsers();
      const allUsers = response.users || [];
      const agencyUsers = allUsers.filter((user: any) => user.role === 'agency');
      setAgencies(agencyUsers);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      toast.error('Failed to load agencies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'pending') => {
    try {
      setUpdatingStatus(userId);
      await api.updateUserStatus(userId, { status: newStatus });
      
      toast.success('Agency status updated successfully');
      
      // Refresh the list
      fetchAgencies();
    } catch (error) {
      console.error('Error updating agency status:', error);
      toast.error('Failed to update agency status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  const columns = [
    { key: 'name', label: 'Name', className: 'min-w-[120px]' },
    { key: 'email', label: 'Email', className: 'min-w-[180px]' },
    { key: 'agencyName', label: 'Agency Name', className: 'min-w-[150px]' },
    { key: 'phoneNumber', label: 'Phone', className: 'min-w-[120px]' },
    { key: 'address', label: 'Address', className: 'min-w-[200px]' },
    {
      key: 'status',
      label: 'Status',
      className: 'min-w-[100px]',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'createdAt',
      label: 'Registered',
      className: 'min-w-[100px]',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'min-w-[120px]',
      render: (value: any, row: Agency) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusUpdate(row._id, row.status === 'active' ? 'pending' : 'active')}
            disabled={updatingStatus === row._id}
            className={`${
              row.status === 'active' 
                ? 'text-yellow-600 hover:text-yellow-900' 
                : 'text-green-600 hover:text-green-900'
            } disabled:opacity-50`}
            title={row.status === 'active' ? 'Set to Pending' : 'Approve Agency'}
          >
            {row.status === 'active' ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
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
            <h1 className="text-2xl font-semibold text-gray-900">Agencies</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage real estate agencies
            </p>
          </div>
        </div>

        <div className="mt-6">
          <SearchBar
            placeholder="Search agencies..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-md"
            id="agencies-search"
            name="agenciesSearch"
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <Table
            columns={columns}
            data={filteredAgencies}
            className="mt-4"
          />
        </div>

        {filteredAgencies.length === 0 && !isLoading && (
          <div className="mt-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No agencies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No agencies match your search criteria.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAdminGuard(AgenciesPage);
