import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import { initializeAuthAsync, updateTokens } from "../features/auth/authSlice";
import GuestLayout from "../layouts/GuestLayout";
import HomePage from "../pages/common/HomePage";
import ProductListPage from "../pages/products/ProductListPage";
import ProductDetailPage from "../pages/products/ProductDetailPage";
import ProfilePage from "../pages/user/ProfilePage";
import OrderManagementPage from "../pages/orders/OrderManagementPage";
import OrderCompletionPage from "../pages/orders/OrderCompletionPage";
import PaymentPage from "../pages/payment/PaymentPage";
import PaymentCallbackPage from "../pages/payment/PaymentCallbackPage";
import LoginPage from "../pages/auth/LoginPage";
import SignUpPage from "../pages/auth/SignUpPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import OAuth2CallbackPage from "../pages/auth/OAuth2CallbackPage";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminSellerRequestsPage from "../pages/admin/AdminSellerRequestsPage";
import SellerLayout from "../layouts/SellerLayout";
import CreateListingPage from "../pages/seller/CreateListingPage";
import ManageListingsPage from "../pages/seller/ManageListingsPage";
import BidderApprovalsPage from "../pages/seller/BidderApprovalsPage";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRouterContent() {
  const dispatch = useAppDispatch();

  // Initialize auth from localStorage on mount
  useEffect(() => {
    dispatch(initializeAuthAsync());

    // Listen for storage changes (multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "accessToken" ||
        e.key === "refreshToken" ||
        e.key === "user"
      ) {
        dispatch(initializeAuthAsync());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch]);

  // Listen for token refresh events from axios interceptor
  useEffect(() => {
    const handleTokenRefresh = (event: CustomEvent) => {
      const { accessToken, refreshToken } = event.detail;
      // Update tokens in Redux store
      dispatch(updateTokens({ accessToken, refreshToken }));
    };

    window.addEventListener(
      "tokenRefreshed",
      handleTokenRefresh as EventListener
    );
    return () =>
      window.removeEventListener(
        "tokenRefreshed",
        handleTokenRefresh as EventListener
      );
  }, [dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAuth>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute requireAuth>
              <OrderManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId/complete"
          element={
            <ProtectedRoute requireAuth>
              <OrderCompletionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:productId"
          element={
            <ProtectedRoute requireAuth>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route path="/vnpay-return" element={<PaymentCallbackPage />} />
        <Route
          path="/login"
          element={
            <ProtectedRoute requireGuest>
              <LoginPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <ProtectedRoute requireGuest>
              <SignUpPage />
            </ProtectedRoute>
          }
        />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/oauth2/callback" element={<OAuth2CallbackPage />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAuth>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="seller-requests" element={<AdminSellerRequestsPage />} />
      </Route>

      {/* Seller routes */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute requireAuth>
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="listings" element={<ManageListingsPage />} />
        <Route path="listings/create" element={<CreateListingPage />} />
        <Route path="bidder-approvals" element={<BidderApprovalsPage />} />
      </Route>
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppRouterContent />
    </BrowserRouter>
  );
}
