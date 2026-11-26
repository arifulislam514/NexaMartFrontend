import React from 'react';
import { Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { AlertTriangle, Store } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

/**
 * Route wrapper that restricts access to Admin / Staff users only.
 * Matches the access restricted screen design from nexamart_app.tsx.
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  const isUserAdmin = Boolean(
    isAdmin ||
    user?.is_staff ||
    user?.is_superuser ||
    user?.role === 'admin'
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Verifying admin permissions...</p>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but not an admin -> show restricted screen from nexamart_app.tsx
  if (!isUserAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center animate-fade-in">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6 shadow-sm ring-4 ring-rose-50">
          <AlertTriangle className="w-10 h-10 text-rose-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Access Restricted</h1>
        <p className="text-slate-500 mb-8 max-w-md">
          You do not have the required administrator privileges to view this back-office system.
        </p>
        <Link
          to="/"
          className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Store className="w-5 h-5" /> Return to Storefront
        </Link>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
