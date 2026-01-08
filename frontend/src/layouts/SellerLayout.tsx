/**
 * Seller Layout Component
 * Layout for seller-specific pages with sidebar navigation
 */

import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectUser, selectAuthLoading } from "../features/auth/authSlice";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const SellerLayout = () => {
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const location = useLocation();

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

  // Redirect if user is not authenticated or doesn't have SELLER role
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Handle both array and Set formats, and check for both "SELLER"/"ROLE_SELLER" and "ADMIN"/"ROLE_ADMIN"
  const rolesArray = user.roles
    ? Array.isArray(user.roles)
      ? user.roles
      : Array.from(user.roles)
    : [];

  const hasSellerRole = rolesArray.some(
    (role) => role === "SELLER" || role === "ROLE_SELLER"
  );
  const hasAdminRole = rolesArray.some(
    (role) => role === "ADMIN" || role === "ROLE_ADMIN"
  );

  // Check if user has SELLER or ADMIN role (admins can also access seller features)
  if (!hasSellerRole && !hasAdminRole) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: "My Listings", icon: <InventoryIcon />, path: "/seller/listings" },
    {
      name: "Create Listing",
      icon: <AddCircleIcon />,
      path: "/seller/listings/create",
    },
    {
      name: "Bidder Approvals",
      icon: <AssignmentIcon />,
      path: "/seller/bidder-approvals",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary">Seller Panel</h2>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowBackIcon className="mr-3" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
