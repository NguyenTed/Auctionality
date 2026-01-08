/**
 * Centralized Axios Instance
 * Configured with base URL, interceptors, and token refresh logic
 */

import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

// Base URL for API - includes /api prefix since all backend endpoints start with /api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true, // Important: send cookies with requests
});

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || undefined);
    }
  });
  failedQueue = [];
};

// Request interceptor - automatically attach token to requests
// Note: With httpOnly cookies, tokens are sent automatically by the browser
// We still try to read from localStorage as fallback for backward compatibility
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try localStorage first (fallback), but prefer cookies
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Cookies are sent automatically by browser, no need to set header
    // But we keep Authorization header for compatibility
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // No refresh token, clear auth and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        processQueue(error, null);
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint - cookies are sent automatically
        // Backend will set new cookies in response
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true, // Important: send cookies
          }
        );
        
        // Backend returns tokens in response body (for backward compatibility)
        // But also sets httpOnly cookies
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update localStorage as fallback (for backward compatibility)
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Dispatch custom event to notify Redux store of token refresh
        window.dispatchEvent(new CustomEvent("tokenRefreshed", {
          detail: { accessToken, refreshToken: newRefreshToken },
        }));

        if (originalRequest.headers && accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        processQueue(refreshError as AxiosError, null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

