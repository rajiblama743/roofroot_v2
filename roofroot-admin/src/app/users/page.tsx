'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Eye, CheckCircle, Clock } from 'lucide-react';
import { withAdminGuard } from '@/components/withAdminGuard';
import AdminLayout from '@/components/AdminLayout';
import Table from '@/components/Table';
import SearchBar from '@/components/SearchBar';
import ConfirmDialog from '@/components/ConfirmDialog';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'agency' | 'customer';
  status?: 'active' | 'pending';
  phoneNumber?: string;
  agencyName?: string;
  createdAt: string;
}

function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.agencyName && user.agencyName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await api.deleteUser(selectedUser._id);
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the list
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'pending') => {
    try {
      setUpdatingStatus(userId);
      await api.updateUserStatus(userId, { status: newStatus });
      
      if (newStatus === 'active') {
        toast.success('User approved successfully');
      } else {
        toast.success('User status updated');
      }
      
      // Refresh the list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      agency: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
    return null;
  };

  const columns = [
    { key: 'name', label: 'Name', className: 'min-w-[120px]' },
    { key: 'email', label: 'Email', className: 'min-w-[180px]' },
    { 
      key: 'role', 
      label: 'Role',
      className: 'min-w-[80px]',
      render: (value: string) => getRoleBadge(value)
    },
    { 
      key: 'status', 
      label: 'Status',
      className: 'min-w-[80px]',
      render: (value: string) => getStatusBadge(value)
    },
    { key: 'agencyName', label: 'Agency', className: 'min-w-[120px]' },
    { key: 'phoneNumber', label: 'Phone', className: 'min-w-[120px]' },
    {
      key: 'createdAt',
      label: 'Created',
      className: 'min-w-[100px]',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'min-w-[120px]',
      render: (value: any, row: User) => (
        <div className="flex space-x-2">
          {/* Show approval/rejection buttons for pending agency users */}
          {row.role === 'agency' && row.status === 'pending' && (
            <button
              onClick={() => handleStatusUpdate(row._id, 'active')}
              disabled={updatingStatus === row._id}
              className="text-green-600 hover:text-green-900 disabled:opacity-50"
              title="Approve Agency"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
          {/* Show pending button for active agency users */}
          {row.role === 'agency' && row.status === 'active' && (
            <button
              onClick={() => handleStatusUpdate(row._id, 'pending')}
              disabled={updatingStatus === row._id}
              className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
              title="Set to Pending"
            >
              <Clock className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => router.push(`/users/${row._id}`)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(row);
              setShowDeleteDialog(true);
            }}
            className="text-red-600 hover:text-red-900"
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
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
            <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage all users in the platform
            </p>
          </div>
          <button
            onClick={() => {/* TODO: Create user modal */}}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>

        <div className="mt-6">
          <SearchBar
            placeholder="Search users..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-md"
            id="users-search"
            name="usersSearch"
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <Table
            columns={columns}
            data={filteredUsers}
            className="mt-4"
          />
        </div>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeleteUser}
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}

export default withAdminGuard(UsersPage);
