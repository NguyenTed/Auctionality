/**
 * Category Service
 * Axios API calls for category feature
 */

import axiosInstance from "../../api/axiosInstance";
import type Category from "../../interfaces/Category";

export const categoryService = {
  getCategoryTree: async (): Promise<Category[]> => {
    const response = await axiosInstance.get<Category[]>("/categories/tree");
    return response.data;
  },
};

