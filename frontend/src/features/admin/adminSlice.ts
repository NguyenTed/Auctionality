/**
 * Admin Slice
 * Redux Toolkit slice for admin state management
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../app/store";
import {
  adminService,
  type AdminDashboardStats,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  type User,
  type SellerUpgradeRequest,
} from "./adminService";
import type { Product } from "../../interfaces/Product";
// Category type not needed in slice
import type PagedResponse from "../../interfaces/Pagination";

// Define the admin state interface
interface AdminState {
  dashboardStats: AdminDashboardStats | null;
  products: PagedResponse<Product> | null;
  users: PagedResponse<User> | null;
  sellerUpgradeRequests: SellerUpgradeRequest[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AdminState = {
  dashboardStats: null,
  products: null,
  users: null,
  sellerUpgradeRequests: [],
  isLoading: false,
  error: null,
};

// Typed async thunk creator
const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

// Async thunks
export const fetchDashboardStatsAsync = createAppAsyncThunk(
  "admin/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getDashboardStats();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch dashboard statistics"
      );
    }
  }
);

export const fetchAdminProductsAsync = createAppAsyncThunk(
  "admin/fetchProducts",
  async ({ page = 1, size = 10 }: { page?: number; size?: number }, { rejectWithValue }) => {
    try {
      return await adminService.getAllProducts(page, size);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch products"
      );
    }
  }
);

export const fetchAdminUsersAsync = createAppAsyncThunk(
  "admin/fetchUsers",
  async ({ page = 1, size = 10 }: { page?: number; size?: number }, { rejectWithValue }) => {
    try {
      return await adminService.getAllUsers(page, size);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch users"
      );
    }
  }
);

export const fetchSellerUpgradeRequestsAsync = createAppAsyncThunk(
  "admin/fetchSellerUpgradeRequests",
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getPendingSellerUpgradeRequests();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch seller upgrade requests"
      );
    }
  }
);

export const createCategoryAsync = createAppAsyncThunk(
  "admin/createCategory",
  async (payload: CreateCategoryRequest, { rejectWithValue }) => {
    try {
      return await adminService.createCategory(payload);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to create category"
      );
    }
  }
);

export const updateCategoryAsync = createAppAsyncThunk(
  "admin/updateCategory",
  async ({ id, payload }: { id: number; payload: UpdateCategoryRequest }, { rejectWithValue }) => {
    try {
      return await adminService.updateCategory(id, payload);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to update category"
      );
    }
  }
);

export const deleteCategoryAsync = createAppAsyncThunk(
  "admin/deleteCategory",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminService.deleteCategory(id);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete category"
      );
    }
  }
);

export const removeProductAsync = createAppAsyncThunk(
  "admin/removeProduct",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminService.removeProduct(id);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to remove product"
      );
    }
  }
);

export const takeDownProductAsync = createAppAsyncThunk(
  "admin/takeDownProduct",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminService.takeDownProduct(id);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to take down product"
      );
    }
  }
);

export const updateUserStatusAsync = createAppAsyncThunk(
  "admin/updateUserStatus",
  async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
    try {
      return await adminService.updateUserStatus(id, status);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to update user status"
      );
    }
  }
);

export const deleteUserAsync = createAppAsyncThunk(
  "admin/deleteUser",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminService.deleteUser(id);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete user"
      );
    }
  }
);

export const approveSellerUpgradeRequestAsync = createAppAsyncThunk(
  "admin/approveSellerUpgradeRequest",
  async (id: number, { rejectWithValue }) => {
    try {
      return await adminService.approveSellerUpgradeRequest(id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to approve seller upgrade request"
      );
    }
  }
);

export const rejectSellerUpgradeRequestAsync = createAppAsyncThunk(
  "admin/rejectSellerUpgradeRequest",
  async (id: number, { rejectWithValue }) => {
    try {
      return await adminService.rejectSellerUpgradeRequest(id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to reject seller upgrade request"
      );
    }
  }
);

// Slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Dashboard Stats
    builder
      .addCase(fetchDashboardStatsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStatsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Products
    builder
      .addCase(fetchAdminProductsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminProductsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProductsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(removeProductAsync.fulfilled, (state, action) => {
        if (state.products?.items) {
          state.products.items = state.products.items.filter((p) => p.id !== action.payload);
        }
      })
      .addCase(takeDownProductAsync.fulfilled, (state, action) => {
        if (state.products?.items) {
          const product = state.products.items.find((p) => p.id === action.payload);
          if (product) {
            product.status = "REMOVED";
          }
        }
      });

    // Users
    builder
      .addCase(fetchAdminUsersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserStatusAsync.fulfilled, (state, action) => {
        if (state.users?.items) {
          const index = state.users.items.findIndex((u) => u.id === action.payload.id);
          if (index !== -1) {
            state.users.items[index] = action.payload;
          }
        }
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        if (state.users?.items) {
          state.users.items = state.users.items.filter((u) => u.id !== action.payload);
        }
      });

    // Seller Upgrade Requests
    builder
      .addCase(fetchSellerUpgradeRequestsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerUpgradeRequestsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sellerUpgradeRequests = action.payload;
      })
      .addCase(fetchSellerUpgradeRequestsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(approveSellerUpgradeRequestAsync.fulfilled, (state, action) => {
        state.sellerUpgradeRequests = state.sellerUpgradeRequests.filter(
          (r) => r.id !== action.payload.id
        );
      })
      .addCase(rejectSellerUpgradeRequestAsync.fulfilled, (state, action) => {
        state.sellerUpgradeRequests = state.sellerUpgradeRequests.filter(
          (r) => r.id !== action.payload.id
        );
      });
  },
});

export const { clearError } = adminSlice.actions;

// Selectors
export const selectDashboardStats = (state: RootState) => state.admin.dashboardStats;
export const selectAdminProducts = (state: RootState) => state.admin.products;
export const selectAdminUsers = (state: RootState) => state.admin.users;
export const selectSellerUpgradeRequests = (state: RootState) => state.admin.sellerUpgradeRequests;
export const selectAdminLoading = (state: RootState) => state.admin.isLoading;
export const selectAdminError = (state: RootState) => state.admin.error;

export default adminSlice.reducer;

