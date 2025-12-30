/**
 * Admin Layout
 * Layout component for admin pages with sidebar navigation
 */

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppSelector } from "../app/hooks";
import { selectIsAuthenticated, selectUser, selectAuthLoading } from "../features/auth/authSlice";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import HomeIcon from "@mui/icons-material/Home";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectAuthLoading);

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // If user is not loaded yet, wait
    if (!user) {
      return;
    }

    // Check if user has ADMIN role
    // Roles can be "ADMIN" or "ROLE_ADMIN" depending on source
    // Handle both array and Set formats
    const rolesArray = user.roles 
      ? (Array.isArray(user.roles) ? user.roles : Array.from(user.roles))
      : [];
    
    const hasAdminRole = rolesArray.some(
      (role) => role === "ADMIN" || role === "ROLE_ADMIN"
    );

    if (!hasAdminRole) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
    { path: "/admin/categories", label: "Categories", icon: CategoryIcon },
    { path: "/admin/products", label: "Products", icon: InventoryIcon },
    { path: "/admin/users", label: "Users", icon: PeopleIcon },
    { path: "/admin/seller-requests", label: "Seller Requests", icon: UpgradeIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                  isActive ? "bg-primary/10 text-primary border-r-2 border-primary" : ""
                }`}
              >
                <Icon className="text-xl" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-6 border-t">
          <Link
            to="/"
            className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors mb-3"
          >
            <HomeIcon />
            <span>Back to Home</span>
          </Link>
          <div className="text-sm text-gray-500">
            Logged in as: <span className="font-medium">{user?.email}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}

