/**
 * Auth Service
 * Axios API calls for authentication feature
 */

import axiosInstance from "../../api/axiosInstance";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  recaptchaToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    phoneNumber?: string;
    avatarUrl?: string;
    isEmailVerified: boolean;
    status: string;
    ratingPercent?: number;
    createdAt: string;
  };
  roles: string[];
  permissions: string[];
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  status: string;
  ratingPercent?: number;
  createdAt: string;
  roles?: string[];
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<void> => {
    await axiosInstance.post("/auth/verify-email", { token });
  },

  resendVerificationEmail: async (email: string): Promise<void> => {
    await axiosInstance.post("/auth/resend-verification", { email });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await axiosInstance.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await axiosInstance.post("/auth/reset-password", { token, newPassword });
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post("/auth/logout", { refreshToken });
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>("/auth/me");
    return response.data;
  },
};

