import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  ClipboardList,
  MessageSquare,
  Users,
  Store,
  LogOut,
  X,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

/**
 * Sidebar Component for Admin Dashboard
 * Strictly adheres to nexamart_app.tsx AdminSidebar design.
 * Supports both desktop persistent sidebar and mobile slide-over drawer.
 *
 * @param {Object} props
 * @param {boolean} [props.isOpen=false] - Mobile sidebar open state
 * @param {Function} [props.onClose] - Mobile sidebar close handler
 * @param {number} [props.pendingOrders] - Optional badge count for pending orders
 * @param {string} [props.className='']
 */
const Sidebar = ({
  isOpen = false,
  onClose,
  pendingOrders = 0,
  className = '',
}) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      path: '/admin/products',
      icon: Package,
      label: 'Products',
    },
    {
      path: '/admin/categories',
      icon: Tag,
      label: 'Categories',
    },
    {
      path: '/admin/orders',
      icon: ClipboardList,
      label: 'Orders',
      badge: pendingOrders > 0 ? pendingOrders : null,
    },
    {
      path: '/admin/reviews',
      icon: MessageSquare,
      label: 'Reviews',
    },
    {
      path: '/admin/users',
      icon: Users,
      label: 'Customers',
    },
  ];

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 flex-shrink-0">
        <Link
          to="/admin/dashboard"
          onClick={handleLinkClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl leading-none">N</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Nexa<span className="text-indigo-400">Admin</span>
          </span>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Management
        </div>

        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/admin/dashboard' &&
              location.pathname.startsWith(item.path));

          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 space-y-1 flex-shrink-0">
        {/* Return to Storefront */}
        <Link
          to="/"
          onClick={handleLinkClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Store className="w-5 h-5 text-indigo-400" />
          <span>View Storefront</span>
        </Link>

        {/* Sign Out */}
        <button
          type="button"
          onClick={() => {
            handleLinkClick();
            logout();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-sm font-medium cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 flex-shrink-0 z-40 hidden md:block ${className}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over with Backdrop) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
