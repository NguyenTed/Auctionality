/**
 * Bid Service
 * Axios API calls for bid feature
 */

import axiosInstance from "../../api/axiosInstance";

export interface PlaceBidRequest {
  amount: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
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
  bidderId: number;
  bidderName: string;
  amount: number;
  createdAt: string;
}

export interface AutoBidConfig {
  id: number;
  productId: number;
  bidderId: number;
  maxPrice: number;
  createdAt: string;
}

export interface ErrorResponse {
  message: string | object;
  status: number;
  timestamp: string;
}

export const bidService = {
  getBidHistory: async (productId: number): Promise<BidHistoryDto[]> => {
    const response = await axiosInstance.get<BidHistoryDto[]>(
      `/bids/products/${productId}/history/sync`
    );
    return response.data;
  },

  placeBid: async (productId: number, amount: number): Promise<{ autoBidConfig: AutoBidConfig | null }> => {
    const response = await axiosInstance.post<ApiResponse<AutoBidConfig> | ErrorResponse>(
      `/bids/products/${productId}`,
      { amount }
    );
    
    // Check if response is an error response (status 202 for BidPendingApprovalException)
    if (response.status === 202) {
      const errorData = response.data as ErrorResponse;
      const error = new Error(
        typeof errorData.message === 'string' 
          ? errorData.message 
          : 'Your bid requires approval before being placed'
      );
      (error as any).response = {
        data: errorData,
        status: 202,
      };
      throw error;
    }
    
    // Backend returns ApiResponse<AutoBidConfig>
    // Structure: { message: string, data: AutoBidConfig }
    const apiResponse = response.data as ApiResponse<AutoBidConfig>;
    return {
      autoBidConfig: apiResponse?.data || null,
    };
  },

  getAutoBidConfig: async (productId: number): Promise<AutoBidConfig | null> => {
    try {
      const response = await axiosInstance.get<AutoBidConfig>(
        `/bids/products/${productId}/auto-bid-config`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  rejectBidder: async (productId: number, bidderId: number, reason?: string): Promise<void> => {
    await axiosInstance.delete(`/bids/products/${productId}/bidders/${bidderId}`, {
      data: reason ? { reason } : undefined,
    });
  },
};

