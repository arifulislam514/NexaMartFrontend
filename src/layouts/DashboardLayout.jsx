import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardNavbar from '../components/Dashboard/DashboardNavbar';
import { useOrders } from '../hooks/useOrders';

/**
 * DashboardLayout Component
 * Comprehensive administrative layout shell matching nexamart_app.tsx AdminLayout.
 * Features:
 * - Persistent desktop navigation sidebar + mobile slide-over drawer
 * - Fixed header with search, notifications, and administrator menu
 * - Live pending order badge synchronization via useOrders hook
 * - Main content outlet with auto-scroll to top on route navigation
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Optional override child content (defaults to <Outlet />)
 * @param {string} [props.className='']
 */
const DashboardLayout = ({ children, className = '' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);

  // Auto-fetch orders to show live pending orders counter in sidebar
  const { orders } = useOrders({ autoFetch: true });

  // Calculate pending orders count for sidebar badge ('Ready To Ship', 'Not Paid', 'Processing')
  const pendingOrders = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return 0;
    return orders.filter((order) => {
      const status = (order.status || '').toLowerCase();
      return (
        status === 'ready to ship' ||
        status === 'not paid' ||
        status === 'processing' ||
        status === 'pending'
      );
    }).length;
  }, [orders]);

  // Scroll main view to top when navigating between admin subpages
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  return (
    <div
      className={`flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200 selection:text-indigo-900 ${className}`}
    >
      {/* Admin Navigation Sidebar (Desktop + Mobile slide-over) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        pendingOrders={pendingOrders}
      />

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <DashboardNavbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Admin View Content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in"
        >
          {children || <Outlet context={{ isSidebarOpen, setIsSidebarOpen, pendingOrders }} />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
