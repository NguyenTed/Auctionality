/**
 * Order Service
 * Axios API calls for order feature
 */

import axiosInstance from "../../api/axiosInstance";

export interface OrderDto {
  id: number;
  product: {
    id: number;
    title: string;
    status: string;
    images?: Array<{ id: number; url: string; isThumbnail: boolean }>;
  };
  buyer: {
    id: number;
    email: string;
    fullName: string;
  };
  seller: {
    id: number;
    email: string;
    fullName: string;
  };
  finalPrice: number;
  status: string;
  createdAt: string;
}

export const orderService = {
  buyNow: async (productId: number): Promise<OrderDto> => {
    const response = await axiosInstance.post<OrderDto>(
      `/products/${productId}/buy-now`
    );
    return response.data;
  },

  getOrders: async (
    isSeller: boolean = false,
    page: number = 1,
    size: number = 10
  ): Promise<{ items: OrderDto[]; pagination: any }> => {
    const response = await axiosInstance.get<{
      items: OrderDto[];
      pagination: any;
    }>(`/orders?isSeller=${isSeller}&page=${page}&size=${size}`);
    return response.data;
  },
};
