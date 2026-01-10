/**
 * Watchlist Service
 * Axios API calls for watchlist feature
 */

import axiosInstance from "../../api/axiosInstance";
import type { Product } from "../../interfaces/Product";
import type { Pagination } from "../../interfaces/Pagination";

export interface WatchlistItem {
  id: number;
  product: Product;
  createdAt: string;
}

export interface WatchlistPagedResponse {
  items: WatchlistItem[];
  pagination: Pagination;
}

export const watchlistService = {
  getWatchlist: async (): Promise<WatchlistItem[]> => {
    const response = await axiosInstance.get<WatchlistItem[]>("/users/watchlist");
    return response.data;
  },

  getWatchlistWithFilters: async (
    keyword?: string,
    categoryId?: number | null,
    page: number = 1,
    size: number = 10
  ): Promise<WatchlistPagedResponse> => {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (categoryId) params.append("categoryId", categoryId.toString());
    params.append("page", page.toString());
    params.append("size", size.toString());

    const response = await axiosInstance.get<WatchlistPagedResponse>(
      `/users/watchlist?${params.toString()}`
    );
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

