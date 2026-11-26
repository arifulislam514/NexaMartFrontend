import React from 'react';
import { Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { Store, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

/**
 * SellerRoute Component
 * Route guard that restricts access exclusively to approved sellers (isApprovedSeller === true).
 * Non-sellers or pending sellers are cleanly guided to /become-seller.
 */
const SellerRoute = ({ children }) => {
  const { isAuthenticated, isApprovedSeller, isPendingSeller, loading, sellerLoading } = useAuth();
  const location = useLocation();

  if (loading || sellerLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Verifying seller credentials...</p>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If application is pending -> redirect or show pending status
  if (isPendingSeller) {
    return <Navigate to="/become-seller" replace />;
  }

  // If not an approved seller -> redirect to become-seller
  if (!isApprovedSeller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center animate-fade-in">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-sm ring-4 ring-amber-50">
          <Store className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Seller Account Required</h1>
        <p className="text-slate-500 mb-8 max-w-md">
          You need an approved seller account to access the Seller Dashboard and manage your store.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/become-seller"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Apply to Become a Seller <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default SellerRoute;
