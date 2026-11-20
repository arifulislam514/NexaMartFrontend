import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  LayoutDashboard,
  Package,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

/**
 * Navbar Component
 * Navigation header matching nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {number} [props.cartCount=0] - Number of items in cart (placeholder until CartContext)
 */
const Navbar = ({ cartCount = 0 }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const userDisplayName = user?.name ? user.name.split(' ')[0] : 'Account';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              className="sm:hidden p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl leading-none">N</span>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block tracking-tight">
                NexaMart
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center space-x-8">
            <Link
              to="/products"
              className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/products?category=Electronics"
              className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors"
            >
              Electronics
            </Link>
            <Link
              to="/products?category=Fashion"
              className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors"
            >
              Fashion
            </Link>
          </nav>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-md px-6 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right Actions: Cart & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-rose-500 rounded-full min-w-[18px] shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-1.5 sm:px-3 sm:py-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center border border-indigo-100 text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:block font-medium text-sm max-w-[100px] truncate text-slate-800">
                    {userDisplayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="p-2 sm:px-4 sm:py-2 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-1.5 text-sm font-semibold"
                >
                  <User className="w-5 h-5 text-slate-600" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              )}

              {/* User Dropdown Menu */}
              {isUserMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl py-1.5 bg-white border border-slate-100 ring-1 ring-black/5 focus:outline-none animate-fade-in-up z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-indigo-700 font-semibold hover:bg-indigo-50 flex items-center gap-2.5 transition-colors border-b border-slate-100"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                  >
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>My Orders</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors mt-1 border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 py-4 px-2 space-y-3 animate-fade-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="space-y-1">
              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                All Products
              </Link>
              <Link
                to="/products?category=Electronics"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Electronics
              </Link>
              <Link
                to="/products?category=Fashion"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Fashion
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
