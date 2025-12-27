/**
 * User Service
 * Axios API calls for user-related features
 */

import axiosInstance from "../../api/axiosInstance";
import type { Product } from "../../interfaces/Product";

export interface OrderRating {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
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
};

