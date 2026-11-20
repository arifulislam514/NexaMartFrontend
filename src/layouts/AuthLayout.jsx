import React from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * AuthLayout
 * Shared layout for authentication pages (Login, Register, Password Reset, etc.)
 * Strictly matches the typography, colors, and styling from nexamart_app.tsx.
 */
const AuthLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // If already logged in, redirect to home
  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 animate-fade-in">
      {/* Top Branding / Logo */}
      <div className="mb-6 flex flex-col items-center">
        <Link
          to="/"
          className="flex items-center gap-2 group transition-transform hover:scale-105"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-extrabold text-2xl leading-none">N</span>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            NexaMart
          </span>
        </Link>
      </div>

      {/* Main Card Container */}
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 relative">
        {children ? children : <Outlet />}
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <span>&larr;</span> Return to Storefront
        </Link>
        <p className="mt-2 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} NexaMart. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
