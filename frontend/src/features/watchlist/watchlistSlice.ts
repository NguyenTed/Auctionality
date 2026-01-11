/**
 * Watchlist Slice
 * Redux Toolkit slice for watchlist state management
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../app/store";
import { watchlistService, type WatchlistItem } from "./watchlistService";

interface WatchlistState {
  items: WatchlistItem[];
  productIds: number[]; // Array of product IDs for quick lookup (serializable)
  isLoading: boolean;
  error: string | null;
}

const initialState: WatchlistState = {
  items: [],
  productIds: [],
  isLoading: false,
  error: null,
};

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export const fetchWatchlistAsync = createAppAsyncThunk(
  "watchlist/fetchWatchlist",
  async (_, { rejectWithValue }) => {
    try {
      const items = await watchlistService.getWatchlist();
      return items;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch watchlist"
      );
    }
  }
);

export const addToWatchlistAsync = createAppAsyncThunk(
  "watchlist/addToWatchlist",
  async (productId: number, { rejectWithValue }) => {
    try {
      const item = await watchlistService.addToWatchlist(productId);
      return item;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to add to watchlist"
      );
    }
  }
);

export const removeFromWatchlistAsync = createAppAsyncThunk(
  "watchlist/removeFromWatchlist",
  async (productId: number, { rejectWithValue }) => {
    try {
      await watchlistService.removeFromWatchlist(productId);
      return productId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to remove from watchlist"
      );
    }
  }
);

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    clearWatchlist: (state) => {
      state.items = [];
      state.productIds = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Watchlist
    builder
      .addCase(fetchWatchlistAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWatchlistAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const items = Array.isArray(action.payload) ? action.payload : [];
        state.items = items;
        state.productIds = items.map((item) => item.product.id);
        state.error = null;
      })
      .addCase(fetchWatchlistAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to Watchlist
    builder
      .addCase(addToWatchlistAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWatchlistAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
        const productId = action.payload.product.id;
        if (!state.productIds.includes(productId)) {
          state.productIds.push(productId);
        }
        state.error = null;
      })
      .addCase(addToWatchlistAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove from Watchlist
    builder
      .addCase(removeFromWatchlistAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWatchlistAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((item) => item.product.id !== action.payload);
        state.productIds = state.productIds.filter((id) => id !== action.payload);
        state.error = null;
      })
      .addCase(removeFromWatchlistAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWatchlist } = watchlistSlice.actions;

// Selectors
export const selectWatchlistItems = (state: RootState) => state.watchlist.items;
export const selectWatchlistProductIds = (state: RootState) => state.watchlist.productIds;
export const selectWatchlistLoading = (state: RootState) => state.watchlist.isLoading;
export const selectWatchlistError = (state: RootState) => state.watchlist.error;
export const selectIsInWatchlist = (productId: number) => (state: RootState) =>
  state.watchlist.productIds.includes(productId);

export default watchlistSlice.reducer;

