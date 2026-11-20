import apiClient from './apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

/**
 * Authentication and User Service
 * Implements endpoints from API_DOCUMENTATION.md Section 2.1
 */
const authService = {
  /**
   * Register a new user account.
   * POST /api/v1/auth/users/
   */
  async register(userData) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  /**
   * Log in user and obtain JWT tokens.
   * POST /api/v1/auth/jwt/create/
   */
  async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    const { access, refresh } = response.data;

    if (access) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
    }
    if (refresh) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
    }

    return response.data;
  },

  /**
   * Refresh JWT access token.
   * POST /api/v1/auth/jwt/refresh/
   */
  async refreshToken(refreshToken) {
    const refresh = refreshToken || localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refresh });
    if (response.data?.access) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access);
    }
    return response.data;
  },

  /**
   * Verify JWT token validity.
   * POST /api/v1/auth/jwt/verify/
   */
  async verifyToken(token) {
    const tokenToVerify = token || localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY, {
      token: tokenToVerify,
    });
    return response.data;
  },

  /**
   * Activate user account via uid & token.
   * POST /api/v1/auth/users/activation/
   */
  async activateAccount({ uid, token }) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.ACTIVATION, {
      uid,
      token,
    });
    return response.data;
  },

  /**
   * Get current logged-in user profile.
   * GET /api/v1/auth/users/me/
   */
  async getCurrentUser() {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.CURRENT_USER);
    if (response.data) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
    }
    return response.data;
  },

  /**
   * Update current user profile details.
   * PATCH /api/v1/auth/users/me/
   */
  async updateProfile(profileData) {
    const response = await apiClient.patch(API_ENDPOINTS.AUTH.CURRENT_USER, profileData);
    if (response.data) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
    }
    return response.data;
  },

  /**
   * Change user password.
   * POST /api/v1/auth/users/set_password/
   */
  async setPassword({ current_password, new_password }) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.SET_PASSWORD, {
      current_password,
      new_password,
    });
    return response.data;
  },

  /**
   * Clear local authentication state (Logout).
   */
  logout() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Check if user has an access token in storage.
   */
  isAuthenticated() {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get stored user profile from localStorage if present.
   */
  getStoredUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Get stored access token.
   */
  getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get stored refresh token.
   */
  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

export default authService;
