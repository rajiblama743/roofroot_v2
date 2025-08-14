'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash2, Building2 } from 'lucide-react';
import AgencyLayout from '@/components/AgencyLayout';
import { Table, SearchBar, ConfirmDialog } from '@/components/shared';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { withAgencyGuard } from '@/components/withAgencyGuard';

interface Listing {
  _id: string;
  title: string;
  type: 'sale' | 'lease';
  price: number;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function AgencyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; listingId: string | null; listingTitle: string }>({
    isOpen: false,
    listingId: null,
    listingTitle: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    // Filter listings based on search term
    if (searchTerm.trim() === '') {
      setFilteredListings(listings);
    } else {
      const filtered = listings.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredListings(filtered);
    }
  }, [searchTerm, listings]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMyListings();
      
      if (response.success && response.listings) {
        setListings(response.listings);
        setFilteredListings(response.listings);
      } else {
        console.error('Failed to fetch listings:', response.message);
        toast.error('Failed to load listings');
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.listingId) return;

    try {
      const response = await apiClient.deleteListing(deleteDialog.listingId);
      
      if (response.success) {
        toast.success('Listing deleted successfully');
        // Remove from local state
        setListings(prev => prev.filter(listing => listing._id !== deleteDialog.listingId));
        setFilteredListings(prev => prev.filter(listing => listing._id !== deleteDialog.listingId));
      } else {
        toast.error(response.message || 'Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    } finally {
      setDeleteDialog({ isOpen: false, listingId: null, listingTitle: '' });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-blue-100 text-blue-800',
      rented: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.inactive}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeClasses = {
      sale: 'bg-blue-100 text-blue-800',
      lease: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeClasses[type as keyof typeof typeClasses] || typeClasses.sale}`}>
        {type === 'lease' ? 'Rent' : 'Sale'}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns = [
    {
      key: 'title',
      label: 'Property',
      render: (value: any, listing: Listing) => (
        <div>
          <div className="font-medium text-gray-900">{listing.title}</div>
          <div className="text-sm text-gray-500">{listing.location}</div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: any, listing: Listing) => getTypeBadge(listing.type)
    },
    {
      key: 'price',
      label: 'Price',
      render: (value: any, listing: Listing) => (
        <div className="font-medium text-gray-900">
          {formatPrice(listing.price)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, listing: Listing) => getStatusBadge(listing.status)
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: any, listing: Listing) => formatDate(listing.createdAt)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, listing: Listing) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/agency/listings/${listing._id}`)}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/agency/listings/${listing._id}/edit`)}
            className="text-green-600 hover:text-green-900 p-1"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteDialog({
              isOpen: true,
              listingId: listing._id,
              listingTitle: listing.title
            })}
            className="text-red-600 hover:text-red-900 p-1"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <AgencyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AgencyLayout>
    );
  }

  return (
    <AgencyLayout>
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Listings</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your property listings
            </p>
          </div>
          <button
            onClick={() => router.push('/agency/listings/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </button>
        </div>

        <div className="mt-6">
          <SearchBar
            placeholder="Search listings..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        <div className="mt-6">
          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building2 className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first listing.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/agency/listings/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Listing
                </button>
              )}
            </div>
          ) : (
            <Table
              data={filteredListings}
              columns={columns}
              className="mt-4"
            />
          )}
        </div>

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, listingId: null, listingTitle: '' })}
          onConfirm={handleDelete}
          title="Delete Listing"
          message={`Are you sure you want to delete "${deleteDialog.listingTitle}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AgencyLayout>
  );
}

export default withAgencyGuard(AgencyListingsPage);
