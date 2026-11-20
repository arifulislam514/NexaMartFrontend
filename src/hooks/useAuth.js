import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to access AuthContext
 *
 * Provides:
 * - user: Current user object with { id, email, first_name, last_name, name, is_staff, role, address, phone_number }
 * - isAuthenticated: boolean
 * - isAdmin: boolean
 * - loading: boolean
 * - error: string | null
 * - login(email, password): Promise
 * - register(userData, autoLogin?): Promise
 * - logout(): void
 * - updateProfile(profileData): Promise
 * - changePassword({ current_password, new_password }): Promise
 * - refreshProfile(): Promise
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
