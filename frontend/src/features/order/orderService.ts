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

export interface ShippingAddressDto {
  id: number;
  orderId: number;
  receiverName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface ShipmentDto {
  id: number;
  orderId: number;
  carrier: string;
  trackingNumber: string;
  shippedAt: string;
  deliveredAt?: string;
}

export interface ShippingAddressRequest {
  receiverName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface TransactionCancellationDto {
  id: number;
  orderId: number;
  cancelledByUser: {
    id: number;
    email: string;
    fullName: string;
  };
  reason: string;
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
  ): Promise<{ items: OrderDto[]; pagination: { currentPage: number; totalPages: number; totalItems: number } }> => {
    const response = await axiosInstance.get<{
      items: OrderDto[];
      pagination: { currentPage: number; totalPages: number; totalItems: number };
    }>(`/orders?isSeller=${isSeller}&page=${page}&size=${size}`);
    return response.data;
  },

  getOrderById: async (orderId: number): Promise<OrderDto> => {
    const response = await axiosInstance.get<OrderDto>(
      `/orders/${orderId}`
    );
    return response.data;
  },

  getOrderByProductId: async (productId: number): Promise<OrderDto> => {
    const response = await axiosInstance.get<OrderDto>(
      `/orders/product/${productId}`
    );
    return response.data;
  },

  getShippingAddress: async (
    orderId: number
  ): Promise<ShippingAddressDto> => {
    const response = await axiosInstance.get<ShippingAddressDto>(
      `/orders/${orderId}/shipping-address`
    );
    return response.data;
  },

  createShippingAddress: async (
    orderId: number,
    data: ShippingAddressRequest
  ): Promise<void> => {
    await axiosInstance.post(`/orders/${orderId}/shipping-address`, data);
  },

  shipOrder: async (orderId: number): Promise<void> => {
    await axiosInstance.post(`/orders/${orderId}/ship`);
  },

  confirmDelivery: async (orderId: number): Promise<void> => {
    await axiosInstance.post(`/orders/${orderId}/deliver`);
  },

  getShipment: async (orderId: number): Promise<ShipmentDto> => {
    const response = await axiosInstance.get<ShipmentDto>(
      `/orders/${orderId}/shipment`
    );
    return response.data;
  },

  cancelOrder: async (
    orderId: number,
    data: CancelOrderRequest
  ): Promise<TransactionCancellationDto> => {
    const response = await axiosInstance.delete<TransactionCancellationDto>(
      `/orders/${orderId}/cancel`,
      { data }
    );
    return response.data;
  },
};

