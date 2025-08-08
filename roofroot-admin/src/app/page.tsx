'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, Search, TrendingUp } from 'lucide-react';
import { withAdminGuard } from '@/components/withAdminGuard';
import AdminLayout from '@/components/AdminLayout';
import StatCard from '@/components/StatCard';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalAgencies: number;
  totalListings: number;
  activeListings: number;
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAgencies: 0,
    totalListings: 0,
    activeListings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users
        const usersResponse = await api.getUsers();
        const users = usersResponse.users || [];
        
        // Fetch listings
        const listingsResponse = await api.getListings();
        const listings = listingsResponse.listings || [];

        // Calculate stats
        const totalUsers = users.length;
        const totalAgencies = users.filter((user: any) => user.role === 'agency').length;
        const totalListings = listings.length;
        const activeListings = listings.filter((listing: any) => listing.status !== 'inactive').length;

        setStats({
          totalUsers,
          totalAgencies,
          totalListings,
          activeListings,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of your RoofRoot platform
        </p>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            change="+12%"
            changeType="positive"
          />
          <StatCard
            title="Agencies"
            value={stats.totalAgencies}
            icon={Building2}
            change="+5%"
            changeType="positive"
          />
          <StatCard
            title="Total Listings"
            value={stats.totalListings}
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
            <div className="px-4 py-5 sm:p-6">
              <p className="text-sm text-gray-500">
                No recent activity to display.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAdminGuard(DashboardPage);
