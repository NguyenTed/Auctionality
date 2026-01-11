/**
 * Admin Service
 * Axios API calls for admin features
 */

import axiosInstance from "../../api/axiosInstance";
import type { Product } from "../../interfaces/Product";
import type PagedResponse from "../../interfaces/Pagination";
import type Category from "../../interfaces/Category";

export interface AdminDashboardStats {
  totalUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalBids: number;
  endingSoonProducts: number;
  pendingSellerRequests: number;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parentId?: number | null;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  parentId?: number | null;
  clearParent?: boolean;
}

export interface User {
  id: number;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  status: string;
  ratingPercent: number | null;
  createdAt: string;
}

export interface SellerUpgradeRequest {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  status: string;
  requestedAt: string;
}

export const adminService = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await axiosInstance.get<AdminDashboardStats>("/admin/dashboard/stats");
    return response.data;
  },

  // Category Management
  createCategory: async (payload: CreateCategoryRequest): Promise<Category> => {
    const response = await axiosInstance.post<Category>("/admin/categories", payload);
    return response.data;
  },

  updateCategory: async (id: number, payload: UpdateCategoryRequest): Promise<Category> => {
    const response = await axiosInstance.put<Category>(`/admin/categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/categories/${id}`);
  },

  // Product Management
  getAllProducts: async (page = 1, size = 10): Promise<PagedResponse<Product>> => {
    const response = await axiosInstance.get<PagedResponse<Product>>("/admin/products", {
      params: { page, size },
    });
    return response.data;
  },

  removeProduct: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/products/${id}`);
  },

  takeDownProduct: async (id: number): Promise<void> => {
    await axiosInstance.post(`/admin/products/${id}/take-down`);
  },

  // User Management
  getAllUsers: async (page = 1, size = 10): Promise<PagedResponse<User>> => {
    const response = await axiosInstance.get<PagedResponse<User>>("/admin/users", {
      params: { page, size },
    });
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await axiosInstance.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  updateUserStatus: async (id: number, status: string): Promise<User> => {
    const response = await axiosInstance.put<User>(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/users/${id}`);
  },

  // Seller Upgrade Requests
  getPendingSellerUpgradeRequests: async (): Promise<SellerUpgradeRequest[]> => {
    const response = await axiosInstance.get<SellerUpgradeRequest[]>("/admin/seller-upgrade-requests");
    console.log(response.data)
    return response.data;
  },

  approveSellerUpgradeRequest: async (id: number): Promise<SellerUpgradeRequest> => {
    const response = await axiosInstance.post<SellerUpgradeRequest>(`/admin/seller-upgrade-requests/${id}/approve`);
    return response.data;
  },

  rejectSellerUpgradeRequest: async (id: number): Promise<SellerUpgradeRequest> => {
    const response = await axiosInstance.post<SellerUpgradeRequest>(`/admin/seller-upgrade-requests/${id}/reject`);
    return response.data;
  },
};

