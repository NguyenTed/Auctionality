import axiosClient from "./axiosClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface EmailVerificationRequest {
  token: string;
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

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<void> => {
    await axiosClient.post("/auth/verify-email", { token });
  },

  resendVerificationEmail: async (email: string): Promise<void> => {
    await axiosClient.post("/auth/resend-verification", { email });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await axiosClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await axiosClient.post("/auth/reset-password", { token, newPassword });
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosClient.post("/auth/logout", { refreshToken });
  },

  getCurrentUser: async () => {
    const response = await axiosClient.get("/auth/me");
    return response.data;
  },
};

