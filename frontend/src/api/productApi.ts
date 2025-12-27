import type { Product, ProductRequest } from "../interfaces/Product";
import axiosClient from "./axiosClient";

// Get all products with pagination
export const getAllProducts = (page = 1, size = 10) => {
  const response = axiosClient.get(`/products`, {
    params: { page, size },
  });
  return response;
};

export const getProductById = (id: number) => {
  const response = axiosClient.get(`/products/${id}`);
  return response;
};

export const getTopProducts = (topType: string) => {
  const response = axiosClient.get(`/products/top`, {
    params: { type: topType },
  });
  return response;
};

export const searchProducts = (
  page = 1,
  size = 10,
  keyword = "",
  categoryId?: number | null
) => {
  const response = axiosClient.get(`/products/search`, {
    params: { keyword, page, size, categoryId },
  });
  return response;
};

export const createProduct = async (payload: ProductRequest) => {
  const res = await axiosClient.post<Product>("/products", payload);
  return res;
};

export const deleteProduct = async (id: number) => {
  const res = await axiosClient.delete(`/products/${id}`);
  return res;
};

export const editProduct = async (id: number, payload: ProductRequest) => {
  console.log(payload);
  const res = await axiosClient.put(`/products/${id}`, payload);
  return res;
};

// // Search products (keyword, categoryId, page, size, sort)
// export const searchProducts = (params) => {
//   return axiosInstance.get(`/products/search`, { params });
// };

// // Get product by id
// export const getProductById = (id: string) => {
//   return axiosInstance.get(`/products/${id}`);
// };

// // Create new product
// export const createProduct = (data) => {
//   return axiosInstance.post(`/products`, data);
// };

// // Update product
// export const updateProduct = (id, data) => {
//   return axiosInstance.put(`/products/${id}`, data);
// };

// // Delete product
// export const deleteProduct = (id) => {
//   return axiosInstance.delete(`/products/${id}`);
// };
