/**
 * Category Slice
 * Redux Toolkit slice for category state management
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../app/store";
import { categoryService } from "./categoryService";
import type Category from "../../interfaces/Category";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export const fetchCategoriesAsync = createAppAsyncThunk(
  "category/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getCategoryTree();
      return categories;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch categories"
      );
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoriesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = categorySlice.actions;

// Selectors (memoized)
export const selectCategories = (state: RootState) => state.category.categories;
export const selectCategoryLoading = (state: RootState) => state.category.isLoading;
export const selectCategoryError = (state: RootState) => state.category.error;

export default categorySlice.reducer;

