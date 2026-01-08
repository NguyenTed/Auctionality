/**
 * Admin Dashboard Page
 * Displays statistics and overview for admin
 */

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchDashboardStatsAsync,
  selectDashboardStats,
  selectAdminLoading,
} from "../../features/admin/adminSlice";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import GavelIcon from "@mui/icons-material/Gavel";
import ScheduleIcon from "@mui/icons-material/Schedule";
import UpgradeIcon from "@mui/icons-material/Upgrade";

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectDashboardStats);
  const isLoading = useAppSelector(selectAdminLoading);

  useEffect(() => {
    dispatch(fetchDashboardStatsAsync());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: PeopleIcon,
      color: "bg-blue-500",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: InventoryIcon,
      color: "bg-green-500",
    },
    {
      title: "Active Products",
      value: stats?.activeProducts || 0,
      icon: InventoryIcon,
      color: "bg-emerald-500",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCartIcon,
      color: "bg-purple-500",
    },
    {
      title: "Total Bids",
      value: stats?.totalBids || 0,
      icon: GavelIcon,
      color: "bg-orange-500",
    },
    {
      title: "Ending Soon",
      value: stats?.endingSoonProducts || 0,
      icon: ScheduleIcon,
      color: "bg-red-500",
    },
    {
      title: "Pending Seller Requests",
      value: stats?.pendingSellerRequests || 0,
      icon: UpgradeIcon,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <DashboardIcon className="text-4xl text-primary" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white text-2xl" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

