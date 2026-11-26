import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';
import sellerService from '../services/sellerService';

export const AuthContext = createContext(null);

/**
 * Normalizes user object so that frontend can access `name`, `is_staff`, `role`, etc.
 * comfortably whether from API or legacy format.
 */
const formatUserData = (userData) => {
  if (!userData) return null;
  const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(' ').trim();
  const displayName = fullName || userData.name || userData.email?.split('@')[0] || 'User';
  const isStaff = Boolean(
    userData.is_staff ||
    userData.is_superuser ||
    userData.role === 'admin'
  );

  return {
    ...userData,
    name: displayName,
    role: isStaff ? 'admin' : (userData.role || 'customer'),
    is_staff: isStaff,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cachedUser = authService.getStoredUser();
    return cachedUser ? formatUserData(cachedUser) : null;
  });
  const [sellerProfile, setSellerProfile] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch current authenticated user's seller profile if exists
   */
  const loadSellerProfile = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setSellerProfile(null);
      return null;
    }

    try {
      setSellerLoading(true);
      const profile = await sellerService.getProfile();
      setSellerProfile(profile);
      return profile;
    } catch (err) {
      // 404 or other error means user doesn't have a seller profile yet
      setSellerProfile(null);
      return null;
    } finally {
      setSellerLoading(false);
    }
  }, []);

  /**
   * Fetch current user profile on app load if token exists
   */
  const loadUser = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setSellerProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [profile] = await Promise.all([
        authService.getCurrentUser(),
        loadSellerProfile(),
      ]);
      setUser(formatUserData(profile));
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // If error is 401 or token is invalid, clear state
      if (err.response?.status === 401) {
        authService.logout();
        setUser(null);
        setSellerProfile(null);
      }
      setError(err.response?.data?.detail || 'Failed to authenticate session');
    } finally {
      setLoading(false);
    }
  }, [loadSellerProfile]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Log in user with email & password, then load profile and seller profile.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} Formatted user profile
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login({ email, password });
      const [profile] = await Promise.all([
        authService.getCurrentUser(),
        loadSellerProfile(),
      ]);
      const formatted = formatUserData(profile);
      setUser(formatted);
      return formatted;
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid email or password';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user.
   *
   * @param {Object} userData - Registration payload
   * @param {boolean} [autoLogin=true] - Whether to automatically login after registration
   */
  const register = async (userData, autoLogin = true) => {
    setLoading(true);
    setError(null);
    try {
      const created = await authService.register(userData);
      if (autoLogin && userData.email && userData.password) {
        return await login(userData.email, userData.password);
      }
      return created;
    } catch (err) {
      const errData = err.response?.data;
      let message = 'Registration failed';
      if (typeof errData === 'object' && errData !== null) {
        const firstKey = Object.keys(errData)[0];
        const val = errData[firstKey];
        message = Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val);
      }
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out current user.
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setSellerProfile(null);
    setError(null);
  }, []);

  /**
   * Update profile details for current user.
   *
   * @param {Object} profileData
   */
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await authService.updateProfile(profileData);
      const formatted = formatUserData(updated);
      setUser(formatted);
      return formatted;
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update profile';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change user password.
   *
   * @param {Object} passwords
   * @param {string} passwords.current_password
   * @param {string} passwords.new_password
   */
  const changePassword = async ({ current_password, new_password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.setPassword({ current_password, new_password });
      return res;
    } catch (err) {
      const message =
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.current_password?.[0] ||
        err.response?.data?.detail ||
        'Failed to change password';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const isSeller = Boolean(sellerProfile);
  const isApprovedSeller = Boolean(sellerProfile && sellerProfile.status === 'approved');
  const isPendingSeller = Boolean(sellerProfile && sellerProfile.status === 'pending');

  const value = useMemo(
    () => ({
      user,
      sellerProfile,
      sellerLoading,
      isSeller,
      isApprovedSeller,
      isPendingSeller,
      loading,
      error,
      isAuthenticated: Boolean(user && authService.isAuthenticated()),
      isAdmin: Boolean(
        user?.is_staff ||
        user?.is_superuser ||
        user?.role === 'admin' ||
        user?.email?.toLowerCase().includes('admin')
      ),
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      refreshProfile: loadUser,
      refreshSellerProfile: loadSellerProfile,
    }),
    [
      user,
      sellerProfile,
      sellerLoading,
      isSeller,
      isApprovedSeller,
      isPendingSeller,
      loading,
      error,
      logout,
      loadUser,
      loadSellerProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
