/**
 * Payment Slice
 * Redux Toolkit slice for payment state management
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../app/store";
import { paymentService } from "./paymentService";

interface PaymentState {
  paymentUrl: string | null;
  isLoading: boolean;
  error: string | null;
  callbackResult: {
    success: boolean;
    message: string;
  } | null;
}

const initialState: PaymentState = {
  paymentUrl: null,
  isLoading: false,
  error: null,
  callbackResult: null,
};

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export const getPaymentUrlAsync = createAppAsyncThunk(
  "payment/getPaymentUrl",
  async (productId: number, { rejectWithValue }) => {
    try {
      const paymentUrl = await paymentService.getPaymentUrl(productId);
      return paymentUrl;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to get payment URL"
      );
    }
  }
);

export const processPaymentCallbackAsync = createAppAsyncThunk(
  "payment/processCallback",
  async (queryString: string, { rejectWithValue }) => {
    try {
      const result = await paymentService.processPaymentCallback(queryString);
      return result;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to process payment callback"
      );
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCallbackResult: (state) => {
      state.callbackResult = null;
    },
    clearPaymentUrl: (state) => {
      state.paymentUrl = null;
    },
  },
  extraReducers: (builder) => {
    // Get Payment URL
    builder
      .addCase(getPaymentUrlAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.paymentUrl = null;
      })
      .addCase(getPaymentUrlAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentUrl = action.payload;
        state.error = null;
      })
      .addCase(getPaymentUrlAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.paymentUrl = null;
      });

    // Process Payment Callback
    builder
      .addCase(processPaymentCallbackAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processPaymentCallbackAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.callbackResult = action.payload;
        state.error = null;
      })
      .addCase(processPaymentCallbackAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.callbackResult = {
          success: false,
          message: action.payload as string,
        };
      });
  },
});

export const { clearError, clearCallbackResult, clearPaymentUrl } =
  paymentSlice.actions;

export const selectPaymentUrl = (state: RootState) => state.payment.paymentUrl;
export const selectPaymentLoading = (state: RootState) =>
  state.payment.isLoading;
export const selectPaymentError = (state: RootState) => state.payment.error;
export const selectPaymentCallbackResult = (state: RootState) =>
  state.payment.callbackResult;

export default paymentSlice.reducer;

