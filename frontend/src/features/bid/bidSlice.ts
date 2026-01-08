/**
 * Bid Slice
 * Redux Toolkit slice for bid state management
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../app/store";
import { bidService, type BidHistoryDto } from "./bidService";

interface BidState {
  bidHistory: Record<number, BidHistoryDto[]>; // productId -> bid history
  isLoading: boolean;
  error: string | null;
}

const initialState: BidState = {
  bidHistory: {},
  isLoading: false,
  error: null,
};

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export const fetchBidHistoryAsync = createAppAsyncThunk(
  "bid/fetchBidHistory",
  async (productId: number, { rejectWithValue }) => {
    try {
      const history = await bidService.getBidHistory(productId);
      return { productId, history };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch bid history"
      );
    }
  }
);

export const placeBidAsync = createAppAsyncThunk(
  "bid/placeBid",
  async ({ productId, amount }: { productId: number; amount: number }, { rejectWithValue }) => {
    try {
      const response = await bidService.placeBid(productId, amount);
      return response;
    } catch (error: unknown) {
      const err = error as { 
        response?: { 
          data?: { 
            message?: string | object;
            error?: string;
            status?: number;
          } 
        } 
      };
      
      // Handle BidPendingApprovalException (status 202)
      if (err.response?.data?.status === 202) {
        const message = err.response.data.message;
        const errorMessage = typeof message === 'string' 
          ? message 
          : 'Your bid requires approval before being placed';
        return rejectWithValue({
          type: 'BID_PENDING_APPROVAL',
          message: errorMessage,
        });
      }
      
      return rejectWithValue(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to place bid"
      );
    }
  }
);

const bidSlice = createSlice({
  name: "bid",
  initialState,
  reducers: {
    clearBidHistory: (state, action: { payload: number }) => {
      delete state.bidHistory[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBidHistoryAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBidHistoryAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bidHistory[action.payload.productId] = action.payload.history;
        state.error = null;
      })
      .addCase(fetchBidHistoryAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(placeBidAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(placeBidAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        // Don't optimistically update - wait for real-time updates from backend
        // Bid history will be updated via SSE
      })
      .addCase(placeBidAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBidHistory } = bidSlice.actions;

// Selectors
export const selectBidHistory = (productId: number) => (state: RootState) =>
  state.bid.bidHistory[productId] || [];
export const selectBidLoading = (state: RootState) => state.bid.isLoading;
export const selectBidError = (state: RootState) => state.bid.error;

export default bidSlice.reducer;

