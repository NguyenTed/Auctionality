import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectIsAuthenticated, selectAuthLoading } from "../features/auth/authSlice";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
}

/**
 * ProtectedRoute component
 * Handles route protection based on authentication status
 *
 * @param requireAuth - If true, redirects to login if not authenticated
 * @param requireGuest - If true, redirects to home if already authenticated
 */
export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireGuest = false,
}: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const location = useLocation();

  // Show loading state while checking auth
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

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires guest (login/signup) and user is already authenticated
  if (requireGuest && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

