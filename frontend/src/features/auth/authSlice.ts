/**
 * Auth Slice
 * Redux Toolkit slice for authentication state management
 */

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../../app/store";
import { authService, type LoginRequest, type RegisterRequest, type User } from "./authService";

// Define the auth state interface
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Typed async thunk creator
const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

// Async thunks
export const loginAsync = createAppAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Login failed. Please try again."
      );
    }
  }
);

export const registerAsync = createAppAsyncThunk(
  "auth/register",
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    }
  }
);

export const logoutAsync = createAppAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          await authService.logout(refreshToken);
        } catch (error) {
          console.error("Logout error:", error);
        }
      }
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return null;
    } catch (error: unknown) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return rejectWithValue("Logout failed");
    }
  }
);

export const verifyEmailAsync = createAppAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue, dispatch }) => {
    try {
      await authService.verifyEmail(token);
      // Refresh user data after verification
      void dispatch(getCurrentUserAsync());
      return null;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Email verification failed"
      );
    }
  }
);

export const resendVerificationEmailAsync = createAppAsyncThunk(
  "auth/resendVerificationEmail",
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.resendVerificationEmail(email);
      return null;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      return rejectWithValue(
        err.response?.data?.error || "Failed to resend verification email"
      );
    }
  }
);

export const getCurrentUserAsync = createAppAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (error: unknown) {
      return rejectWithValue("Failed to get current user");
    }
  }
);

export const initializeAuthAsync = createAppAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (storedUser && accessToken && refreshToken) {
        // Verify token is still valid
        try {
          const currentUser = await authService.getCurrentUser();
          return {
            user: currentUser,
            accessToken,
            refreshToken,
          };
        } catch (error) {
          // Token invalid, clear auth
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          return rejectWithValue("Token validation failed");
        }
      }
      return null;
    } catch (error: unknown) {
      return rejectWithValue("Failed to initialize auth");
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Verify Email
    builder
      .addCase(verifyEmailAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmailAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyEmailAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Current User
    builder
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUserAsync.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });

    // Initialize Auth
    builder
      .addCase(initializeAuthAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuthAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuthAsync.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, setTokens, clearAuth, clearError, updateTokens } = authSlice.actions;

// Selectors (memoized)
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;

export default authSlice.reducer;

