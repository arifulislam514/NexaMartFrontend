import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  KeyRound,
  Package,
  ShoppingCart,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import ProfileForm from '../components/Dashboard/Profile/ProfileForm';
import PasswordChangeForm from '../components/Dashboard/Profile/PasswordChangeForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

/**
 * Profile Page
 * Customer account settings hub matching nexamart_app.tsx design.
 * Features tabs for Personal Details and Password & Security,
 * plus quick navigation shortcuts to Orders and Cart.
 */
const Profile = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state: 'profile' | 'password'
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabParam === 'password' ? 'password' : 'profile'
  );

  // Sync state with URL search params
  useEffect(() => {
    if (tabParam === 'password' || tabParam === 'profile') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams(newTab === 'profile' ? {} : { tab: newTab });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20 px-4">
        <LoadingSpinner size="lg" message="Loading your account..." />
      </div>
    );
  }

  // User details
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
  const displayName = fullName || user?.name || user?.email?.split('@')[0] || 'Customer';
  const initialLetter = (displayName.charAt(0) || 'U').toUpperCase();
  const isAdmin = Boolean(user?.is_staff || user?.role === 'admin');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="flex text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link
              to="/"
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
          </li>
          <li className="text-slate-900 font-semibold" aria-current="page">
            My Account
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-1">
          Manage your personal details, shipping information, and account security
        </p>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Account Navigation Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* User Mini Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 text-center">
            {/* Avatar Circle */}
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-indigo-100 mx-auto">
                {initialLetter}
              </div>
              <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-2xs">
                {isAdmin ? (
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
              </div>
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 truncate">
              {displayName}
            </h2>
            <p className="text-xs text-slate-500 font-medium truncate mb-2">
              {user?.email}
            </p>

            {/* Role Badge */}
            <div className="inline-block mb-3">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Staff</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Customer</span>
                </span>
              )}
            </div>

            {user?.date_joined && (
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Joined {formatDate(user.date_joined, { format: 'medium' })}</span>
              </p>
            )}
          </div>

          {/* Account Navigation Tabs */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-3 space-y-1">
            {/* Tab: Personal Information */}
            <button
              type="button"
              onClick={() => handleTabChange('profile')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <User
                  className={`w-4 h-4 ${
                    activeTab === 'profile' ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span>Personal Information</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 ${
                  activeTab === 'profile' ? 'text-white/70' : 'text-slate-300'
                }`}
              />
            </button>

            {/* Tab: Security & Password */}
            <button
              type="button"
              onClick={() => handleTabChange('password')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <KeyRound
                  className={`w-4 h-4 ${
                    activeTab === 'password' ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span>Security & Password</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 ${
                  activeTab === 'password' ? 'text-white/70' : 'text-slate-300'
                }`}
              />
            </button>
          </div>

          {/* Quick Account Links */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 pt-1">
              Storefront Shortcuts
            </h4>

            {/* Link to Orders */}
            <Link
              to="/orders"
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <span>My Orders</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>

            {/* Link to Cart */}
            <Link
              to="/cart"
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span>Shopping Cart</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>

            {/* Sign Out Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Column: Tab View Contents (8 cols) */}
        <main className="lg:col-span-8">
          {activeTab === 'profile' ? (
            <div className="animate-fade-in">
              <ProfileForm
                onPasswordClick={() => handleTabChange('password')}
              />
            </div>
          ) : (
            <div className="animate-fade-in">
              <PasswordChangeForm
                onCancel={() => handleTabChange('profile')}
                onSuccess={() => {
                  // Optional callback on success
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
