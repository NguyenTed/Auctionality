/**
 * Watchlist Service
 * Axios API calls for watchlist feature
 */

import axiosInstance from "../../api/axiosInstance";
import type { Product } from "../../interfaces/Product";

export interface WatchlistItem {
  id: number;
  product: Product;
  createdAt: string;
}

export const watchlistService = {
  getWatchlist: async (): Promise<WatchlistItem[]> => {
    const response = await axiosInstance.get<WatchlistItem[]>("/users/watchlist");
    return response.data;
  },

  addToWatchlist: async (productId: number): Promise<WatchlistItem> => {
    const response = await axiosInstance.post<{ message: string; data: WatchlistItem }>(
      `/users/watchlist/${productId}`
    );
    return response.data.data;
  },

  removeFromWatchlist: async (productId: number): Promise<void> => {
    await axiosInstance.delete(`/users/watchlist/${productId}`);
  },
};

