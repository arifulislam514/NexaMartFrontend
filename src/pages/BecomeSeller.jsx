import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  CheckCircle2,
  Clock,
  Upload,
  AlertCircle,
  Loader2,
  TrendingUp,
  ShieldCheck,
  Package,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import sellerService from '../services/sellerService';

/**
 * BecomeSeller Page
 * Multi-vendor registration and application status tracking page.
 * Path: /become-seller
 */
const BecomeSeller = () => {
  const {
    isAuthenticated,
    user,
    sellerProfile,
    isSeller,
    isApprovedSeller,
    isPendingSeller,
    refreshSellerProfile,
  } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    store_name: '',
    phone: user?.phone_number || '',
    description: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Logo file size must be under 2MB.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  // Submit Application
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/become-seller' } } });
      return;
    }

    if (!formData.store_name.trim() || !formData.phone.trim()) {
      setErrorMessage('Please enter both store name and contact phone number.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const submitData = new FormData();
      submitData.append('store_name', formData.store_name.trim());
      submitData.append('phone', formData.phone.trim());
      submitData.append('description', formData.description.trim());
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      await sellerService.applySeller(submitData);
      await refreshSellerProfile();
      setSuccessMessage('Your seller application has been submitted successfully!');
    } catch (err) {
      console.error('Failed to apply for seller account:', err);
      const detail =
        err.response?.data?.store_name?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to submit application. Please check your information and try again.';
      setErrorMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  // Refresh current seller status
  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      await refreshSellerProfile();
    } finally {
      setCheckingStatus(false);
    }
  };

  // CASE 1: Already an Approved Seller
  if (isApprovedSeller) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-emerald-50">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">You are an Approved Seller!</h2>
          <p className="text-slate-600 text-sm mb-6">
            Your store <strong className="text-slate-900">"{sellerProfile?.store_name}"</strong> is
            active and ready for sales.
          </p>

          <div className="space-y-3">
            <Link
              to="/seller/dashboard"
              className="w-full bg-emerald-600 text-white py-3.5 px-6 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" /> Go to Seller Dashboard
            </Link>

            {sellerProfile?.slug && (
              <Link
                to={`/stores/${sellerProfile.slug}`}
                className="w-full bg-slate-50 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-slate-200"
              >
                View Public Storefront
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: Application is Pending Review
  if (isPendingSeller || successMessage) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-amber-100 shadow-xl text-center animate-fade-in">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-amber-50">
            <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
          </div>

          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200 mb-3">
            APPLICATION UNDER REVIEW
          </span>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
            Your Store Application is Pending
          </h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Thank you for applying to sell on NexaMart! Our administration team is reviewing your
            store details: <br />
            <strong className="text-slate-900 text-base">"{sellerProfile?.store_name || formData.store_name}"</strong>.
            You will be approved shortly.
          </p>

          {/* Timeline steps */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Application Submitted</p>
                <p className="text-[11px] text-slate-500">Store credentials received</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold animate-spin">
                ●
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-800">Admin Review in Progress</p>
                <p className="text-[11px] text-slate-500">Checking store standards & policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-50">
              <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-700">Store Activated</p>
                <p className="text-[11px] text-slate-400">Start uploading and fulfilling orders</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checkingStatus}
              className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
            >
              {checkingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> Check Status Now
                </>
              )}
            </button>
            <Link
              to="/"
              className="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CASE 3: Not applied yet -> Registration Form
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 p-8 sm:p-12 text-white mb-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> NexaMart Partner Program
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Start Selling to Thousands of Shoppers Today
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Open your verified digital storefront on NexaMart. Leverage our integrated logistics,
            secure instant payouts, and flexible coupon tools to grow your business.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-2xl font-extrabold text-emerald-400">10%</p>
              <p className="text-xs text-slate-400 mt-0.5">Fair Commission</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-indigo-400">Instant</p>
              <p className="text-xs text-slate-400 mt-0.5">SubOrder Splitting</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-purple-400">24/7</p>
              <p className="text-xs text-slate-400 mt-0.5">Merchant Tools</p>
            </div>
          </div>
        </div>

        {/* Decorative blur elements */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create Your Store Profile
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Provide your merchant details to register as a verified vendor on NexaMart.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Name */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Store Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                placeholder="e.g. Fashion Hub, TechGear BD"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
              />
              <p className="text-xs text-slate-400 mt-1">
                This will be your public shop name displayed on your storefront and products.
              </p>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Merchant Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01700000000"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Store Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell customers about your products, quality standards, warranty, and experience..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
              />
            </div>

            {/* Store Logo Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Store Logo (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, or WEBP up to 2MB (recommended square 400x400)
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Store Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Seller Application</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Benefits & FAQ Card */}
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Why Sell on NexaMart?
            </h3>
            <ul className="space-y-3.5 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Full Catalog Ownership:</strong> Create, edit, and manage your products
                  with multi-image galleries.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>SubOrder Fulfillment:</strong> Manage each package individually with
                  courier tracking numbers.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Custom Coupons:</strong> Run promotional percentage or fixed discounts
                  specifically for your store.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Transparent Accounting:</strong> Live earnings dashboard tracking
                  delivered payouts and platform commission.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100 text-center">
            <Store className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">Need Help Getting Started?</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Our merchant onboarding team is available to assist you with store setup and product listings.
            </p>
            <a
              href="mailto:merchant-support@nexamart.com"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
            >
              Contact Merchant Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;
