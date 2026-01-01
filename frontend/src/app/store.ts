/**
 * Redux Store Configuration
 * Centralized store using Redux Toolkit
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import productReducer from "../features/product/productSlice";
import categoryReducer from "../features/category/categorySlice";
import watchlistReducer from "../features/watchlist/watchlistSlice";
import bidReducer from "../features/bid/bidSlice";
import adminReducer from "../features/admin/adminSlice";
import sellerReducer from "../features/seller/sellerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    category: categoryReducer,
    watchlist: watchlistReducer,
    bid: bidReducer,
    admin: adminReducer,
    seller: sellerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

