/**
 * Seller Slice
 * Redux Toolkit slice for seller state management
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../app/store";
import { sellerService, type BidderApproval } from "./sellerService";
import type { Product, ProductRequest } from "../../interfaces/Product";

// Define the seller state interface
interface SellerState {
  myProducts: Product[];
  bidderApprovals: BidderApproval[];
  isLoading: boolean;
  error: string | null;
  pagination: { page: number; size: number; totalItems: number; totalPages: number; hasNext: boolean; hasPrevious: boolean } | null;
}

// Initial state
const initialState: SellerState = {
  myProducts: [],
  bidderApprovals: [],
  isLoading: false,
  error: null,
  pagination: null,
};

// Typed async thunk creator
const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

// Async thunks
export const fetchMyProductsAsync = createAppAsyncThunk(
  "seller/fetchMyProducts",
  async ({ page = 1, size = 10 }: { page?: number; size?: number } = {}, { rejectWithValue }) => {
    try {
      return await sellerService.getMyProducts(page, size);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch your products"
      );
    }
  }
);

export const createProductAsync = createAppAsyncThunk(
  "seller/createProduct",
  async (payload: ProductRequest, { rejectWithValue }) => {
    try {
      return await sellerService.createProduct(payload);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to create product"
      );
    }
  }
);

export const updateProductAsync = createAppAsyncThunk(
  "seller/updateProduct",
  async ({ id, payload }: { id: number; payload: ProductRequest }, { rejectWithValue }) => {
    try {
      return await sellerService.updateProduct(id, payload);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to update product"
      );
    }
  }
);

export const deleteProductAsync = createAppAsyncThunk(
  "seller/deleteProduct",
  async (id: number, { rejectWithValue }) => {
    try {
      await sellerService.deleteProduct(id);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete product"
      );
    }
  }
);

export const fetchBidderApprovalsAsync = createAppAsyncThunk(
  "seller/fetchBidderApprovals",
  async (_, { rejectWithValue }) => {
    try {
      return await sellerService.getPendingBidderApprovals();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch bidder approvals"
      );
    }
  }
);

export const approveBidderApprovalAsync = createAppAsyncThunk(
  "seller/approveBidderApproval",
  async (approvalId: number, { rejectWithValue }) => {
    try {
      await sellerService.approveBidderApproval(approvalId);
      return approvalId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to approve bidder"
      );
    }
  }
);

export const rejectBidderApprovalAsync = createAppAsyncThunk(
  "seller/rejectBidderApproval",
  async (approvalId: number, { rejectWithValue }) => {
    try {
      await sellerService.rejectBidderApproval(approvalId);
      return approvalId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to reject bidder"
      );
    }
  }
);

// Slice
const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // My Products
    builder
      .addCase(fetchMyProductsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProductsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProducts = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyProductsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createProductAsync.fulfilled, (state, action) => {
        state.myProducts.push(action.payload);
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const index = state.myProducts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.myProducts[index] = action.payload;
        }
      })
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.myProducts = state.myProducts.filter((p) => p.id !== action.payload);
      });

    // Bidder Approvals
    builder
      .addCase(fetchBidderApprovalsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBidderApprovalsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bidderApprovals = action.payload;
      })
      .addCase(fetchBidderApprovalsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(approveBidderApprovalAsync.fulfilled, (state, action) => {
        state.bidderApprovals = state.bidderApprovals.filter(
          (a) => a.id !== action.payload
        );
      })
      .addCase(rejectBidderApprovalAsync.fulfilled, (state, action) => {
        state.bidderApprovals = state.bidderApprovals.filter(
          (a) => a.id !== action.payload
        );
      });
  },
});

export const { clearError } = sellerSlice.actions;

// Selectors
export const selectMyProducts = (state: RootState) => state.seller.myProducts;
export const selectBidderApprovals = (state: RootState) => state.seller.bidderApprovals;
export const selectSellerLoading = (state: RootState) => state.seller.isLoading;
export const selectSellerError = (state: RootState) => state.seller.error;
export const selectSellerPagination = (state: RootState) => state.seller.pagination;

export default sellerSlice.reducer;

