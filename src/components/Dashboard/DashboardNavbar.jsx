import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  User,
  Store,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

/**
 * DashboardNavbar Component
 * Header navigation bar for Admin Dashboard strictly matching nexamart_app.tsx design.
 * Features search input, notifications toggle, mobile hamburger toggle, and admin user menu.
 *
 * @param {Object} props
 * @param {Function} [props.onToggleSidebar] - Handler for mobile hamburger menu
 * @param {string} [props.className='']
 */
const DashboardNavbar = ({ onToggleSidebar, className = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const displayName = user?.name || user?.first_name || 'Admin User';
  const initialLetter = (displayName.charAt(0) || 'A').toUpperCase();

  return (
    <header
      className={`h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-2xs ${className}`}
    >
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global search (Ctrl+K)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
          />
        </form>
      </div>

      {/* Right: Notifications & User Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications Button & Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative p-2.5 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-fade-in">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Notifications</span>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  System
                </span>
              </div>
              <div className="py-2 px-4 divide-y divide-slate-50 text-xs text-slate-600">
                <div className="py-2">
                  <p className="font-semibold text-slate-800">Welcome to NexaAdmin</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Manage products, orders, and review store performance.
                  </p>
                </div>
                <div className="py-2">
                  <p className="font-semibold text-slate-800">Security Status</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    JWT authentication active & verified.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-7 w-px bg-slate-200 hidden sm:block" />

        {/* User Account Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 sm:px-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            {/* User Meta (hidden on small screens) */}
            <div className="flex flex-col items-end hidden sm:flex text-right">
              <span className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors max-w-[120px] truncate">
                {displayName}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5">
                Superadmin
              </span>
            </div>

            {/* User Avatar Circle */}
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold rounded-full flex items-center justify-center shadow-md text-sm shadow-indigo-200">
              {initialLetter}
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <Store className="w-4 h-4 text-slate-400" />
                  <span>View Storefront</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
