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

// Function to get initial state - checks localStorage synchronously for immediate auth state
// This prevents flicker and redirect loops on page reload
function getInitialState(): AuthState {
  // Check if tokens exist in localStorage (synchronous check)
  // We'll validate them asynchronously in initializeAuthAsync
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const storedUser = localStorage.getItem("user");
  
  let user: User | null = null;
  try {
    if (storedUser) {
      user = JSON.parse(storedUser) as User;
    }
  } catch (error) {
    console.warn("Failed to parse stored user:", error);
  }

  // If tokens exist, optimistically assume authenticated (will be validated in initializeAuthAsync)
  // Set isLoading to true so we wait for validation before making redirect decisions
  const hasTokens = accessToken !== null && refreshToken !== null && user !== null;
  
  return {
    user: hasTokens ? user : null,
    accessToken: accessToken,
    refreshToken: refreshToken,
    isAuthenticated: hasTokens, // Optimistically set to true if tokens exist
    isLoading: true, // Always start as true to wait for validation
    error: null,
  };
}

// Initial state
const initialState: AuthState = getInitialState();

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
      // Update localStorage with user including roles
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
        // Verify token is still valid and get fresh user data with roles
        try {
          const currentUser = await authService.getCurrentUser();
          // Get roles from fresh user data (getCurrentUser now returns roles)
          // Convert Set to Array if needed (JSON serialization converts Set to object)
          const roles = currentUser.roles || [];
          let rolesArray: string[] = [];
          if (Array.isArray(roles)) {
            rolesArray = roles;
          } else if (typeof roles === 'object' && roles !== null) {
            // Handle Set or plain object (from JSON serialization)
            rolesArray = Object.values(roles).filter((v): v is string => typeof v === 'string');
          }
          // Ensure roles are always stored as array in localStorage
          const userWithRoles = { ...currentUser, roles: rolesArray };
          localStorage.setItem("user", JSON.stringify(userWithRoles));
          return {
            user: userWithRoles,
            roles: rolesArray,
            accessToken,
            refreshToken,
          };
        } catch (error) {
          // Token invalid, clear auth
          // Return null instead of rejecting to avoid redirect loops
          // The fulfilled handler will set isAuthenticated = false
          console.warn("Token validation failed during auth initialization:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          return null;
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
        // Convert roles to array if needed (backend might send Set or object)
        const roles = action.payload.roles || [];
        let rolesArray: string[] = [];
        if (Array.isArray(roles)) {
          rolesArray = roles;
        } else if (typeof roles === 'object' && roles !== null) {
          // Handle Set or plain object (from JSON serialization)
          rolesArray = Object.values(roles).filter((v): v is string => typeof v === 'string');
        }
        state.user = { ...action.payload.user, roles: rolesArray };
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        // Update localStorage with user including roles
        localStorage.setItem("user", JSON.stringify(state.user));
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
        // Convert roles to array if needed (backend might send Set or object)
        const roles = action.payload.roles || [];
        let rolesArray: string[] = [];
        if (Array.isArray(roles)) {
          rolesArray = roles;
        } else if (typeof roles === 'object' && roles !== null) {
          // Handle Set or plain object (from JSON serialization)
          rolesArray = Object.values(roles).filter((v): v is string => typeof v === 'string');
        }
        state.user = { ...action.payload.user, roles: rolesArray };
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
        // Update localStorage with user including roles
        localStorage.setItem("user", JSON.stringify(state.user));
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
        // Convert roles to array if needed (backend sends Set which becomes object in JSON)
        const roles = action.payload?.roles || [];
        let rolesArray: string[] = [];
        if (Array.isArray(roles)) {
          rolesArray = roles;
        } else if (typeof roles === 'object' && roles !== null) {
          // Handle Set or plain object (from JSON serialization)
          rolesArray = Object.values(roles).filter((v): v is string => typeof v === 'string');
        }
        state.user = { ...action.payload, roles: rolesArray };
        state.isAuthenticated = true;
        // Update localStorage with fresh user data including roles as array
        if (action.payload) {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
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
          // Ensure roles are properly set - use roles from payload or from user object
          // Convert Set to Array if needed (JSON serialization converts Set to object)
          const roles = action.payload.roles || action.payload.user?.roles || [];
          let rolesArray: string[] = [];
          if (Array.isArray(roles)) {
            rolesArray = roles;
          } else if (typeof roles === 'object' && roles !== null) {
            // Handle Set or plain object (from JSON serialization)
            rolesArray = Object.values(roles).filter((v): v is string => typeof v === 'string');
          }
          state.user = { ...action.payload.user, roles: rolesArray };
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          // Update localStorage with user including roles as array
          localStorage.setItem("user", JSON.stringify(state.user));
        } else {
          // No valid auth found - clear state
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuthAsync.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        // Clear auth state on rejection (shouldn't happen often now, but keep for safety)
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
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

