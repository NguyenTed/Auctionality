/**
 * Bid Service
 * Axios API calls for bid feature
 */

import axiosInstance from "../../api/axiosInstance";

export interface PlaceBidRequest {
  amount: number;
}

export interface BidResponse {
  id: number;
  productId: number;
  bidderId: number;
  amount: number;
  isAutoBid: boolean;
  createdAt: string;
  autoBidConfig?: {
    id: number;
    productId: number;
    bidderId: number;
    maxPrice: number;
    createdAt: string;
  } | null;
}

export interface BidHistoryDto {
  bidderName: string;
  amount: number;
  createdAt: string;
}

export const bidService = {
  getBidHistory: async (productId: number): Promise<BidHistoryDto[]> => {
    const response = await axiosInstance.get<BidHistoryDto[]>(
      `/bids/products/${productId}/history/sync`
    );
    return response.data;
  },

  placeBid: async (productId: number, amount: number): Promise<BidResponse> => {
    const response = await axiosInstance.post<BidResponse>(
      `/bids/products/${productId}`,
      { amount }
    );
    return response.data;
  },
};

