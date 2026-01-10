/**
 * User Service
 * Axios API calls for user-related features
 */

import axiosInstance from "../../api/axiosInstance";
import type { Product } from "../../interfaces/Product";

export interface OrderRating {
  id: number;
  orderId: number;
  fromUser: UserDto;
  toUser: UserDto;
  value: number; // 1 or -1
  comment?: string;
  createdAt: string;
}

export interface RatingRequest {
  orderId: number;
  isBuyer: boolean; // true if buyer is rating seller, false if seller is rating buyer
  value: number; // 1 or -1
  comment?: string;
}

export interface UpdateProfileRequest {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserDto {
  id: number;
  email?: string | null; // Can be null if masked
  fullName?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isEmailVerified?: boolean | null; // Can be null if masked
  status: string;
  ratingPercent?: number | null;
  createdAt: string;
  roles?: string[];
}

export const userService = {
  getAuctionProducts: async (): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>("/users/auction-products");
    return response.data;
  },

  getWonProducts: async (): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>("/users/won-products");
    return response.data;
  },

  getRatings: async (): Promise<OrderRating[]> => {
    const response = await axiosInstance.get<OrderRating[]>("/users/rates");
    return response.data;
  },

  updateProfile: async (request: UpdateProfileRequest): Promise<UserDto> => {
    const response = await axiosInstance.put<UserDto>("/users/profile", request);
    return response.data;
  },

  changePassword: async (request: ChangePasswordRequest): Promise<void> => {
    await axiosInstance.post("/users/change-password", request);
  },

  createSellerUpgradeRequest: async (): Promise<any> => {
    const response = await axiosInstance.post("/users/seller-upgrade-requests");
    return response.data;
  },

  createRating: async (request: RatingRequest): Promise<OrderRating> => {
    const response = await axiosInstance.post<OrderRating>("/users/rates", request);
    return response.data;
  },

  getUserProfile: async (userId: number, masked: boolean = false): Promise<UserDto> => {
    const response = await axiosInstance.get<UserDto>(`/users/${userId}/profile`, {
      params: { masked },
    });
    return response.data;
  },
};

