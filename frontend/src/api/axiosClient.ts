import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { authUtils } from "../utils/auth";

// Base URL for API - includes /api prefix since all backend endpoints start with /api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - automatically attach token to requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = authUtils.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
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
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authUtils.getRefreshToken();
      if (!refreshToken) {
        // No refresh token, clear auth and redirect to login
        authUtils.clearAuth();
        window.location.href = "/login";
        processQueue(error, null);
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint directly using raw axios to avoid circular dependency
        // (using axiosClient would trigger the interceptor again)
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens using auth utils
        authUtils.updateTokens(accessToken, newRefreshToken);
        
        // Dispatch custom event to notify auth context of token refresh
        window.dispatchEvent(new CustomEvent("tokenRefreshed", { 
          detail: { accessToken, refreshToken: newRefreshToken } 
        }));

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        authUtils.clearAuth();
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

export default axiosClient;
