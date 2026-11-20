import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * MainLayout Component
 * Standard layout wrapper for storefront pages (Home, Shop, Products, Cart, Checkout, Orders).
 * Strictly follows nexamart_app.tsx structure: Navbar + Main + Footer.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Optional children when not using Outlet
 */
const MainLayout = ({ children }) => {
  const { pathname } = useLocation();

  // Scroll to top on every route transition
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900">
      {/* Sticky Top Header Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow">
        {children ? children : <Outlet />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
