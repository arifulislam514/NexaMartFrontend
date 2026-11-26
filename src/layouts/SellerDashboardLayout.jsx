import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Tag,
  Settings,
  Store,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  User,
  ShoppingBag,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

/**
 * SellerDashboardLayout Component
 * Comprehensive seller back-office layout shell matching NexaMart design system.
 * Features:
 * - Persistent desktop navigation sidebar + mobile slide-over drawer
 * - Overview / Earnings (/seller/dashboard)
 * - My Products (/seller/products)
 * - Customer Orders (/seller/orders)
 * - Discount Coupons (/seller/coupons)
 * - Store Settings (/seller/settings)
 * - Store header with verified seller badge and direct link to public store
 */
const SellerDashboardLayout = ({ children, className = '' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const userMenuRef = useRef(null);

  const { user, sellerProfile, logout } = useAuth();

  const storeName = sellerProfile?.store_name || 'My Store';
  const storeSlug = sellerProfile?.slug || '';
  const storeLogo = sellerProfile?.logo;

  const menuItems = [
    {
      path: '/seller/dashboard',
      icon: LayoutDashboard,
      label: 'Overview / Earnings',
    },
    {
      path: '/seller/products',
      icon: Package,
      label: 'My Products',
    },
    {
      path: '/seller/orders',
      icon: ClipboardList,
      label: 'Customer Orders',
    },
    {
      path: '/seller/coupons',
      icon: Tag,
      label: 'Discount Coupons',
    },
    {
      path: '/seller/settings',
      icon: Settings,
      label: 'Store Settings',
    },
  ];

  // Auto scroll to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 flex-shrink-0">
        <Link
          to="/seller/dashboard"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight leading-none">
              Nexa<span className="text-emerald-400">Seller</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[130px] mt-0.5">
              {storeName}
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Seller Store Quick Card */}
      <div className="px-4 py-3 mx-4 my-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold overflow-hidden flex-shrink-0">
          {storeLogo ? (
            <img src={storeLogo} alt={storeName} className="w-full h-full object-cover" />
          ) : (
            storeName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{storeName}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Approved Seller</span>
          </div>
        </div>
        {storeSlug && (
          <Link
            to={`/stores/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
            title="View Public Store"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Seller Management
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  isActive ? 'text-white/80 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-slate-800/80 space-y-1 flex-shrink-0 bg-slate-900/50">
        {storeSlug && (
          <Link
            to={`/stores/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors w-full"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>Visit Public Store</span>
          </Link>
        )}

        <Link
          to="/"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors w-full"
        >
          <ShoppingBag className="w-4 h-4 text-indigo-400" />
          <span>Back to Marketplace</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors w-full cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 ${className}`}
    >
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 fixed inset-y-0 left-0 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-slate-900 shadow-2xl z-10 animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-xs">
          {/* Left: Mobile Toggle & Store Tag */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle seller menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Seller Center
              </span>
              <span className="text-slate-800 font-bold text-sm sm:text-base truncate max-w-[200px]">
                {storeName}
              </span>
            </div>
          </div>

          {/* Right: Actions & User Dropdown */}
          <div className="flex items-center gap-3">
            {storeSlug && (
              <Link
                to={`/stores/${storeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span>View Store</span>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200">
                  {storeName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {user?.name || user?.email}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Merchant</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl py-1.5 bg-white border border-slate-100 ring-1 ring-black/5 focus:outline-none animate-fade-in-up z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{storeName}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                  </div>

                  <Link
                    to="/seller/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Store Settings</span>
                  </Link>

                  <Link
                    to="/"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                    <span>Customer Storefront</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Seller View Content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in"
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default SellerDashboardLayout;
