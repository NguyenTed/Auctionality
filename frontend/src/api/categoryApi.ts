import axiosClient from "./axiosClient";

// Get all products with pagination
export const getCategoryTree = () => {
  const response = axiosClient.get(`/categories/tree`);
  return response;
};
