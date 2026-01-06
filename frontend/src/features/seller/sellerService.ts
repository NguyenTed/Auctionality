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
    
    // Convert Date to ISO string format (YYYY-MM-DDTHH:mm:ss) for LocalDateTime
    if (payload.startTime) {
      if (payload.startTime instanceof Date) {
        // Format as ISO string without timezone (LocalDateTime format)
        const year = payload.startTime.getFullYear();
        const month = String(payload.startTime.getMonth() + 1).padStart(2, '0');
        const day = String(payload.startTime.getDate()).padStart(2, '0');
        const hours = String(payload.startTime.getHours()).padStart(2, '0');
        const minutes = String(payload.startTime.getMinutes()).padStart(2, '0');
        backendPayload.startTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;
      } else {
        backendPayload.startTime = payload.startTime;
      }
    }
    
    if (payload.endTime) {
      if (payload.endTime instanceof Date) {
        // Format as ISO string without timezone (LocalDateTime format)
        const year = payload.endTime.getFullYear();
        const month = String(payload.endTime.getMonth() + 1).padStart(2, '0');
        const day = String(payload.endTime.getDate()).padStart(2, '0');
        const hours = String(payload.endTime.getHours()).padStart(2, '0');
        const minutes = String(payload.endTime.getMinutes()).padStart(2, '0');
        backendPayload.endTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;
      } else {
        backendPayload.endTime = payload.endTime;
      }
    }
    
    const response = await axiosInstance.post<Product>("/products", backendPayload);
    return response.data;
  },

  updateProduct: async (id: number, payload: ProductRequest): Promise<Product> => {
    // Transform frontend payload to backend DTO format (same as createProduct)
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
    
    // Convert Date to ISO string format (YYYY-MM-DDTHH:mm:ss) for LocalDateTime
    if (payload.startTime) {
      if (payload.startTime instanceof Date) {
        const year = payload.startTime.getFullYear();
        const month = String(payload.startTime.getMonth() + 1).padStart(2, '0');
        const day = String(payload.startTime.getDate()).padStart(2, '0');
        const hours = String(payload.startTime.getHours()).padStart(2, '0');
        const minutes = String(payload.startTime.getMinutes()).padStart(2, '0');
        backendPayload.startTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;
      } else {
        backendPayload.startTime = payload.startTime;
      }
    }
    
    if (payload.endTime) {
      if (payload.endTime instanceof Date) {
        const year = payload.endTime.getFullYear();
        const month = String(payload.endTime.getMonth() + 1).padStart(2, '0');
        const day = String(payload.endTime.getDate()).padStart(2, '0');
        const hours = String(payload.endTime.getHours()).padStart(2, '0');
        const minutes = String(payload.endTime.getMinutes()).padStart(2, '0');
        backendPayload.endTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;
      } else {
        backendPayload.endTime = payload.endTime;
      }
    }
    
    const response = await axiosInstance.put<Product>(`/products/${id}`, backendPayload);
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

