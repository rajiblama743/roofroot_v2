'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Eye, Filter } from 'lucide-react';
import { withAdminGuard } from '@/components/withAdminGuard';
import AdminLayout from '@/components/AdminLayout';
import Table from '@/components/Table';
import SearchBar from '@/components/SearchBar';
import ConfirmDialog from '@/components/ConfirmDialog';
import api from '@/services/api';
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
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'lease'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    // Filter listings based on search term and type filter
    let filtered = listings.filter(listing =>
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (typeFilter !== 'all') {
      filtered = filtered.filter(listing => listing.type === typeFilter);
    }

    setFilteredListings(filtered);
  }, [listings, searchTerm, typeFilter]);

  const fetchListings = async () => {
    try {
      const response = await api.getListings();
      setListings(response.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!selectedListing) return;

    try {
      await api.deleteListing(selectedListing._id);
      toast.success('Listing deleted successfully');
      fetchListings(); // Refresh the list
      setShowDeleteDialog(false);
      setSelectedListing(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      sale: 'bg-green-100 text-green-800',
      lease: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const columns = [
    { key: 'title', label: 'Title', className: 'min-w-[200px]' },
    { key: 'location', label: 'Location', className: 'min-w-[150px]' },
    { 
      key: 'price', 
      label: 'Price',
      className: 'min-w-[100px]',
      render: (value: number) => formatPrice(value)
    },
    { 
      key: 'type', 
      label: 'Type',
      className: 'min-w-[80px]',
      render: (value: string) => getTypeBadge(value)
    },
    { key: 'bedrooms', label: 'Bedrooms', className: 'min-w-[80px]' },
    { key: 'bathrooms', label: 'Bathrooms', className: 'min-w-[80px]' },
    {
      key: 'createdBy',
      label: 'Created By',
      className: 'min-w-[120px]',
      render: (value: any) => value?.name || 'Unknown'
    },
    {
      key: 'createdAt',
      label: 'Created',
      className: 'min-w-[100px]',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'min-w-[100px]',
      render: (value: any, row: Listing) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/listings/${row._id}`)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedListing(row);
              setShowDeleteDialog(true);
            }}
            className="text-red-600 hover:text-red-900"
            title="Delete Listing"
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
            <h1 className="text-2xl font-semibold text-gray-900">Listings</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage all property listings
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <SearchBar
            placeholder="Search listings..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="max-w-md"
            id="listings-search"
            name="listingsSearch"
          />
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'sale' | 'lease')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="sale">Sale</option>
              <option value="lease">Lease</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <Table
            columns={columns}
            data={filteredListings}
            className="mt-4"
          />
        </div>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedListing(null);
          }}
          onConfirm={handleDeleteListing}
          title="Delete Listing"
          message={`Are you sure you want to delete "${selectedListing?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}

export default withAdminGuard(ListingsPage);
