import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import { initializeAuthAsync, updateTokens } from "../features/auth/authSlice";
import GuestLayout from "../layouts/GuestLayout";
import HomePage from "../pages/common/HomePage";
import ProductListPage from "../pages/products/ProductListPage";
import ProductDetailPage from "../pages/products/ProductDetailPage";
import ProfilePage from "../pages/user/ProfilePage";
import LoginPage from "../pages/auth/LoginPage";
import SignUpPage from "../pages/auth/SignUpPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

function AppRouterContent() {
  const dispatch = useAppDispatch();

  // Initialize auth from localStorage on mount
  useEffect(() => {
    dispatch(initializeAuthAsync());

    // Listen for storage changes (multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "refreshToken" || e.key === "user") {
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

    window.addEventListener("tokenRefreshed", handleTokenRefresh as EventListener);
    return () => window.removeEventListener("tokenRefreshed", handleTokenRefresh as EventListener);
  }, [dispatch]);

  return (
      <Routes>
        {/* Public routes */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Protected routes - add requireAuth prop to routes that need authentication */}
        {/* Example:
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireAuth>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        */}
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
