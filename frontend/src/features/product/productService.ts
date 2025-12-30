/**
 * Product Service
 * Axios API calls for product feature
 */

import axiosInstance from "../../api/axiosInstance";
import type { Product, ProductRequest } from "../../interfaces/Product";
import type PagedResponse from "../../interfaces/Pagination";

export interface ProductSearchParams {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: number | null;
  sort?: string;
}

export interface ProductResponse {
  items: Product[];
  pagination: PagedResponse<Product>["pagination"];
}

export const productService = {
  getAllProducts: async (page = 1, size = 10): Promise<ProductResponse> => {
    const response = await axiosInstance.get<ProductResponse>("/products", {
      params: { page, size },
    });
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await axiosInstance.get<Product>(`/products/${id}`);
    return response.data;
  },

  getTopProducts: async (topType: string): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>(`/products/top`, {
      params: { type: topType },
    });
    return response.data;
  },

  searchProducts: async (
    page = 1,
    size = 10,
    keyword = "",
    categoryId?: number | null,
    sort = "endTimeDesc"
  ): Promise<ProductResponse> => {
    const response = await axiosInstance.get<ProductResponse>("/products/search", {
      params: { keyword, page, size, categoryId, sort },
    });
    return response.data;
  },

  createProduct: async (payload: ProductRequest): Promise<Product> => {
    const response = await axiosInstance.post<Product>("/products", payload);
    return response.data;
  },

  updateProduct: async (id: number, payload: ProductRequest): Promise<Product> => {
    const response = await axiosInstance.put<Product>(`/products/${id}`, payload);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },

  getRelatedProducts: async (productId: number): Promise<Product[]> => {
    const response = await axiosInstance.get<Product[]>(`/products/${productId}/related`);
    return response.data;
  },
};

