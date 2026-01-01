/**
 * Product Slice
 * Redux Toolkit slice for product state management
 */

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../app/store";
import { productService, type ProductSearchParams } from "./productService";
import type { Product } from "../../interfaces/Product";
import type PagedResponse from "../../interfaces/Pagination";

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  topProducts: Product[];
  topProductsEndingSoon: Product[];
  topProductsMostBid: Product[];
  pagination: PagedResponse<Product>["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  searchParams: ProductSearchParams;
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  relatedProducts: [],
  topProducts: [],
  topProductsEndingSoon: [],
  topProductsMostBid: [],
  pagination: null,
  isLoading: false,
  error: null,
  searchParams: {
    page: 1,
    size: 10,
    keyword: "",
    categoryId: null,
  },
};

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export const fetchProductsAsync = createAppAsyncThunk(
  "product/fetchProducts",
  async (params: ProductSearchParams, { rejectWithValue }) => {
    try {
      const { page = 1, size = 10, keyword = "", categoryId } = params;
      const response = await productService.getAllProducts(page, size);
      return { items: response.items, pagination: response.pagination, searchParams: { page, size, keyword, categoryId } };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch products"
      );
    }
  }
);

export const fetchProductByIdAsync = createAppAsyncThunk(
  "product/fetchProductById",
  async (id: number, { rejectWithValue }) => {
    try {
      const product = await productService.getProductById(id);
      return product;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch product"
      );
    }
  }
);

export const searchProductsAsync = createAppAsyncThunk(
  "product/searchProducts",
  async (params: ProductSearchParams, { rejectWithValue }) => {
    try {
      const { page = 1, size = 10, keyword = "", categoryId, sort = "endTimeDesc" } = params;
      const response = await productService.searchProducts(page, size, keyword, categoryId, sort);
      return { items: response.items, pagination: response.pagination, searchParams: params };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to search products"
      );
    }
  }
);

export const fetchTopProductsAsync = createAppAsyncThunk(
  "product/fetchTopProducts",
  async (topType: string, { rejectWithValue }) => {
    try {
      const products = await productService.getTopProducts(topType);
      return { products, topType };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch top products"
      );
    }
  }
);

export const createProductAsync = createAppAsyncThunk(
  "product/createProduct",
  async (payload: Parameters<typeof productService.createProduct>[0], { rejectWithValue }) => {
    try {
      const product = await productService.createProduct(payload);
      return product;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to create product"
      );
    }
  }
);

export const updateProductAsync = createAppAsyncThunk(
  "product/updateProduct",
  async (
    { id, payload }: { id: number; payload: Parameters<typeof productService.updateProduct>[1] },
    { rejectWithValue }
  ) => {
    try {
      const product = await productService.updateProduct(id, payload);
      return product;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to update product"
      );
    }
  }
);

export const deleteProductAsync = createAppAsyncThunk(
  "product/deleteProduct",
  async (id: number, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete product"
      );
    }
  }
);

export const fetchRelatedProductsAsync = createAppAsyncThunk(
  "product/fetchRelatedProducts",
  async (productId: number, { rejectWithValue }) => {
    try {
      const products = await productService.getRelatedProducts(productId);
      return { products, productId };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch related products"
      );
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<ProductSearchParams>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic update for bid placement
    updateProductBid: (state, action: PayloadAction<{ productId: number; newPrice: number; bidCount?: number }>) => {
      if (state.currentProduct && state.currentProduct.id === action.payload.productId) {
        state.currentProduct.currentPrice = action.payload.newPrice;
        if (action.payload.bidCount !== undefined) {
          state.currentProduct.bidCount = action.payload.bidCount;
        } else if (state.currentProduct.bidCount !== undefined) {
          state.currentProduct.bidCount += 1;
        }
      }
      // Also update in products list if present
      const productInList = state.products.find((p) => p.id === action.payload.productId);
      if (productInList) {
        productInList.currentPrice = action.payload.newPrice;
        if (action.payload.bidCount !== undefined) {
          productInList.bidCount = action.payload.bidCount;
        } else if (productInList.bidCount !== undefined) {
          productInList.bidCount += 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProductsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.items;
        state.pagination = action.payload.pagination;
        state.searchParams = action.payload.searchParams;
        state.error = null;
      })
      .addCase(fetchProductsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Product By ID
    builder
      .addCase(fetchProductByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Products
    builder
      .addCase(searchProductsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProductsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.items;
        state.pagination = action.payload.pagination;
        state.searchParams = action.payload.searchParams;
        state.error = null;
      })
      .addCase(searchProductsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Top Products
    builder
      .addCase(fetchTopProductsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopProductsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // Store products in appropriate state based on topType
        if (action.payload.topType === "ENDING_SOON") {
          state.topProductsEndingSoon = action.payload.products;
        } else if (action.payload.topType === "MOST_BID") {
          state.topProductsMostBid = action.payload.products;
        }
        // Keep topProducts for backward compatibility (use ENDING_SOON as default)
        state.topProducts = action.payload.topType === "ENDING_SOON" 
          ? action.payload.products 
          : state.topProducts;
        state.error = null;
      })
      .addCase(fetchTopProductsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Product
    builder
      .addCase(createProductAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProductAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.error = null;
      })
      .addCase(createProductAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Product
    builder
      .addCase(updateProductAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProductAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Product
    builder
      .addCase(deleteProductAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
        if (state.currentProduct?.id === action.payload) {
          state.currentProduct = null;
        }
        state.error = null;
      })
      .addCase(deleteProductAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Related Products
    builder
      .addCase(fetchRelatedProductsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRelatedProductsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.relatedProducts = action.payload.products;
        state.error = null;
      })
      .addCase(fetchRelatedProductsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchParams, clearCurrentProduct, clearError, updateProductBid } = productSlice.actions;

// Selectors (memoized)
export const selectProducts = (state: RootState) => state.product.products;
export const selectCurrentProduct = (state: RootState) => state.product.currentProduct;
export const selectRelatedProducts = (state: RootState) => state.product.relatedProducts;
export const selectTopProducts = (state: RootState) => state.product.topProducts;
export const selectTopProductsEndingSoon = (state: RootState) => state.product.topProductsEndingSoon;
export const selectTopProductsMostBid = (state: RootState) => state.product.topProductsMostBid;
export const selectProductPagination = (state: RootState) => state.product.pagination;
export const selectProductLoading = (state: RootState) => state.product.isLoading;
export const selectProductError = (state: RootState) => state.product.error;
export const selectProductSearchParams = (state: RootState) => state.product.searchParams;

export default productSlice.reducer;

