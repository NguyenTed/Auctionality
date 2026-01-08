/**
 * Order Slice
 * Redux Toolkit slice for order state management
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../app/store";
import { orderService, type OrderDto } from "./orderService";

interface OrderState {
  orders: OrderDto[];
  pagination: any | null;
  isLoading: boolean;
  error: string | null;
  buyingNow: Record<number, boolean>; // productId -> buying state
}

const initialState: OrderState = {
  orders: [],
  pagination: null,
  isLoading: false,
  error: null,
  buyingNow: {},
};

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export const buyNowAsync = createAppAsyncThunk(
  "order/buyNow",
  async (productId: number, { rejectWithValue }) => {
    try {
      const order = await orderService.buyNow(productId);
      return { productId, order };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to buy product"
      );
    }
  }
);

export const fetchOrdersAsync = createAppAsyncThunk(
  "order/fetchOrders",
  async (
    { isSeller, page, size }: { isSeller: boolean; page: number; size: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.getOrders(isSeller, page, size);
      return { items: response.items, pagination: response.pagination, isSeller };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch orders"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Buy Now
    builder
      .addCase(buyNowAsync.pending, (state, action) => {
        const productId = action.meta.arg;
        state.buyingNow[productId] = true;
        state.error = null;
      })
      .addCase(buyNowAsync.fulfilled, (state, action) => {
        const { productId } = action.payload;
        state.buyingNow[productId] = false;
        state.error = null;
      })
      .addCase(buyNowAsync.rejected, (state, action) => {
        const productId = action.meta.arg;
        state.buyingNow[productId] = false;
        state.error = action.payload as string;
      });

    // Fetch Orders
    builder
      .addCase(fetchOrdersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrdersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.items;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchOrdersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = orderSlice.actions;

export const selectOrders = (state: RootState) => state.order.orders;
export const selectOrderPagination = (state: RootState) => state.order.pagination;
export const selectOrderLoading = (state: RootState) => state.order.isLoading;
export const selectOrderError = (state: RootState) => state.order.error;
export const selectBuyingNow = (productId: number) => (state: RootState) =>
  state.order.buyingNow[productId] || false;

export default orderSlice.reducer;
