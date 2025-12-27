import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, type LoginRequest, type RegisterRequest } from "../api/authApi";
import { authUtils, type User } from "../utils/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authUtils.getUser();
        const accessToken = authUtils.getAccessToken();

        if (storedUser && accessToken) {
          // Set user immediately for better UX
          setUser(storedUser);
          
          // Verify token is still valid by fetching current user in background
          // This allows the app to load faster while verifying in the background
          authApi.getCurrentUser()
            .then((currentUser) => {
              setUser(currentUser);
              authUtils.updateUser(currentUser);
            })
            .catch((error) => {
              // Token invalid, clear auth
              console.error("Token validation failed:", error);
              authUtils.clearAuth();
              setUser(null);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        authUtils.clearAuth();
        setUser(null);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for storage changes (e.g., token refresh in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "refreshToken" || e.key === "user") {
        const storedUser = authUtils.getUser();
        setUser(storedUser);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Listen for token refresh events from axios interceptor
    const handleTokenRefresh = () => {
      const storedUser = authUtils.getUser();
      if (storedUser) {
        // Refresh user data after token update
        refreshUser().catch(() => {
          // If refresh fails, user will be logged out by the interceptor
        });
      }
    };
    
    window.addEventListener("tokenRefreshed", handleTokenRefresh);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tokenRefreshed", handleTokenRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      authUtils.setAuth(response.accessToken, response.refreshToken, response.user);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      authUtils.setAuth(response.accessToken, response.refreshToken, response.user);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = authUtils.getRefreshToken();
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch (error) {
          // Even if logout fails on server, clear local storage
          console.error("Logout error:", error);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      authUtils.clearAuth();
      setUser(null);
      navigate("/login");
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      authUtils.updateUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If refresh fails, user might be logged out
      authUtils.clearAuth();
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!authUtils.getAccessToken(),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

