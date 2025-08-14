'use client';

import { useEffect, useState } from 'react';
import { Search, TrendingUp, Building2, DollarSign } from 'lucide-react';
import AgencyLayout from '@/components/AgencyLayout';
import { StatCard } from '@/components/shared';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalListings: number;
  forSale: number;
  forRent: number;
  activeListings: number;
}

interface RecentListing {
  _id: string;
  title: string;
  type: 'sale' | 'lease';
  price: number;
  location: string;
  createdAt: string;
}

function AgencyDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    forSale: 0,
    forRent: 0,
    activeListings: 0,
  });
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch agency's listings
        const response = await apiClient.getMyListings();
        if (response.success && response.listings) {
          const listings = response.listings;
          
          // Calculate stats
          const totalListings = listings.length;
          const forSale = listings.filter((listing: any) => listing.type === 'sale').length;
          const forRent = listings.filter((listing: any) => listing.type === 'lease').length;
          const activeListings = listings.filter((listing: any) => listing.status !== 'inactive').length;

          setStats({
            totalListings,
            forSale,
            forRent,
            activeListings,
          });

          // Get recent listings (last 5)
          const recent = listings
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          
          setRecentListings(recent);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of your property listings
        </p>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Listings"
            value={stats.totalListings}
            icon={Building2}
            change="+12%"
            changeType="positive"
          />
          <StatCard
            title="For Sale"
            value={stats.forSale}
            icon={DollarSign}
            change="+5%"
            changeType="positive"
          />
          <StatCard
            title="For Rent"
            value={stats.forRent}
            icon={Search}
            change="+8%"
            changeType="positive"
          />
          <StatCard
            title="Active Listings"
            value={stats.activeListings}
            icon={TrendingUp}
            change="+15%"
            changeType="positive"
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-4 bg-white shadow rounded-lg">
            {recentListings.length > 0 ? (
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {recentListings.map((listing) => (
                    <li key={listing._id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Search className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {listing.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {listing.location} • {listing.type === 'sale' ? 'For Sale' : 'For Rent'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ${listing.price.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500">
                  No recent activity to display.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AgencyLayout>
  );
}

import { withAgencyGuard } from '@/components/withAgencyGuard';

export default withAgencyGuard(AgencyDashboardPage);
