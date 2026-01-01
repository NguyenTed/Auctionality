/**
 * Seller Service
 * Axios API calls for seller features
 */

import axiosInstance from "../../api/axiosInstance";
import type { Product, ProductRequest } from "../../interfaces/Product";
// PagedResponse not needed in service

export interface BidderApproval {
  id: number;
  productId: number;
  productTitle: string;
  bidderId: number;
  bidderName: string;
  bidderEmail: string;
  bidderRating?: number;
  amount: number;
  status: string;
  createdAt: string;
}

export const sellerService = {
  getMyProducts: async (page = 1, size = 10): Promise<{ items: Product[]; pagination: any }> => {
    const response = await axiosInstance.get<{ items: Product[]; pagination: any }>("/products/seller/my-products", {
      params: { page, size },
    });
    return response.data;
  },

  createProduct: async (payload: ProductRequest): Promise<Product> => {
    // Transform frontend payload to backend DTO format
    const backendPayload: any = {
      title: payload.title,
      categoryId: payload.categoryId,
      startPrice: payload.startPrice,
      bidIncrement: payload.bidIncrement,
      autoExtensionEnabled: payload.autoExtensionEnabled,
      description: payload.description || "",
      images: payload.images || [],
    };
    
    if (payload.buyNowPrice) {
      backendPayload.buyNowPrice = payload.buyNowPrice;
    }
    
    if (payload.startTime) {
      backendPayload.startTime = payload.startTime instanceof Date 
        ? payload.startTime.toISOString().slice(0, 16) // Format for LocalDateTime
        : payload.startTime;
    }
    
    if (payload.endTime) {
      backendPayload.endTime = payload.endTime instanceof Date
        ? payload.endTime.toISOString().slice(0, 16) // Format for LocalDateTime
        : payload.endTime;
    }
    
    const response = await axiosInstance.post<Product>("/products", backendPayload);
    return response.data;
  },

  updateProduct: async (id: number, payload: ProductRequest): Promise<Product> => {
    const response = await axiosInstance.put<Product>(`/products/${id}`, payload);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },

  getPendingBidderApprovals: async (): Promise<BidderApproval[]> => {
    const response = await axiosInstance.get<BidderApproval[]>("/bids/bidder-approvals/pending");
    return response.data;
  },

  approveBidderApproval: async (approvalId: number): Promise<void> => {
    await axiosInstance.post(`/bids/bidder-approvals/${approvalId}/approve`);
  },

  rejectBidderApproval: async (approvalId: number): Promise<void> => {
    await axiosInstance.post(`/bids/bidder-approvals/${approvalId}/reject`);
  },
};

