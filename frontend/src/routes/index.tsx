import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import GuestLayout from "../layouts/GuestLayout";
import HomePage from "../pages/common/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import SignUpPage from "../pages/auth/SignUpPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ProtectedRoute from "../components/ProtectedRoute";

// import ProductCreate from "../pages/products/ProductCreate";
// import ProductEdit from "../pages/products/ProductEdit";
// import NotFound from "../pages/NotFound";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route element={<GuestLayout />}>
            <Route path="/" element={<HomePage />} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}
