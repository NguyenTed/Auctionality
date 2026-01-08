/**
 * OAuth2CallbackPage Component
 * Handles OAuth2 callback from social login providers
 */

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { updateTokens, setUser } from "../../features/auth/authSlice";
import { authService } from "../../features/auth/authService";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const success = searchParams.get("success") === "true";
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  const error = searchParams.get("error");

  useEffect(() => {
    if (success && accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Update Redux store
      dispatch(updateTokens({ accessToken, refreshToken }));

      // Fetch user info
      authService
        .getCurrentUser()
        .then((user) => {
          dispatch(setUser(user));
          // Redirect to home after successful login
          setTimeout(() => navigate("/", { replace: true }), 1500);
        })
        .catch((err) => {
          console.error("Failed to fetch user info:", err);
          // Still redirect even if user fetch fails
          setTimeout(() => navigate("/", { replace: true }), 1500);
        });
    } else if (error) {
      // Show error and redirect to login
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } else {
      // No params - redirect to login
      navigate("/login", { replace: true });
    }
  }, [success, accessToken, refreshToken, error, navigate, dispatch]);

  if (success && accessToken && refreshToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-4">
            <CheckCircleIcon className="text-green-600" style={{ fontSize: 40 }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login Successful!</h1>
          <p className="text-gray-600 mb-6">Redirecting you to the homepage...</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-2xl mb-4">
            <ErrorIcon className="text-red-600" style={{ fontSize: 40 }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login Failed</h1>
          <p className="text-gray-600 mb-6">{error || "An error occurred during login"}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <p className="text-gray-600">Processing login...</p>
      </div>
    </div>
  );
}

