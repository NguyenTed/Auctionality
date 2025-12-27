/**
 * Authentication utility functions
 * Handles token storage and retrieval
 */

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  status: string;
  ratingPercent?: number;
  createdAt: string;
}

export const authUtils = {
  /**
   * Get access token from storage
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Get refresh token from storage
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Get current user from storage
   */
  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!authUtils.getAccessToken() && !!authUtils.getUser();
  },

  /**
   * Store authentication data
   */
  setAuth: (accessToken: string, refreshToken: string, user: User): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Update tokens (for refresh)
   */
  updateTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /**
   * Update user data
   */
  updateUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Clear all authentication data
   */
  clearAuth: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

