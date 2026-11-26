import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Store,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Percent,
  Phone,
  FileText,
  Save,
} from 'lucide-react';
import sellerService from '../../services/sellerService';
import useAuth from '../../hooks/useAuth';

/**
 * SellerSettings Page
 * Allows approved merchants to update their store logo, name, phone, description
 * and view their platform commission rate and storefront link.
 * Path: /seller/settings
 */
const SellerSettings = () => {
  const { refreshSellerProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  // Fetch current store profile
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await sellerService.getProfile();
        if (isMounted) {
          setProfile(data);
          setStoreName(data.store_name || '');
          setPhone(data.phone || '');
          setDescription(data.description || '');
          if (data.logo) {
            const logoUrl = data.logo.startsWith('http') ? data.logo : `http://127.0.0.1:8000${data.logo}`;
            setLogoPreview(logoUrl);
          }
          if (data.cover_image) {
            const coverUrl = data.cover_image.startsWith('http') ? data.cover_image : `http://127.0.0.1:8000${data.cover_image}`;
            setCoverPreview(coverUrl);
          }
        }
      } catch (err) {
        console.error('Failed to load seller profile:', err);
        if (isMounted) {
          setError('Failed to load store settings. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Logo file size must be under 2MB.');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Cover banner file size must be under 5MB.');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim() || !phone.trim()) {
      setError('Store name and contact phone are required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      const formData = new FormData();
      formData.append('store_name', storeName.trim());
      formData.append('phone', phone.trim());
      formData.append('description', description.trim());
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (coverFile) {
        formData.append('cover_image', coverFile);
      }

      const updated = await sellerService.updateProfile(formData);
      setProfile(updated);
      await refreshSellerProfile();
      setSuccessMessage('Store settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update store profile:', err);
      const detail =
        err.response?.data?.store_name?.[0] ||
        err.response?.data?.detail ||
        'Failed to save changes. Please try again.';
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Store Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your store brand, contact information, and public storefront details.
          </p>
        </div>

        {profile?.slug && (
          <Link
            to={`/stores/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm rounded-xl border border-emerald-200 transition-colors shadow-2xs self-start"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Preview Public Storefront</span>
          </Link>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Store Meta Information */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Merchant Status
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 capitalize">
                  {profile?.status || 'Active'}
                </p>
                <p className="text-xs text-emerald-600 font-semibold">Verified Partner</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-slate-400" /> Platform Fee
              </span>
              <span className="font-extrabold text-slate-900">
                {profile?.commission_rate || '10.00'}%
              </span>
            </div>
          </div>

          {/* Public Link Card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
            <Store className="w-8 h-8 text-emerald-400 mb-3" />
            <h4 className="font-bold text-sm">Your Storefront URL</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
              Customers can view and purchase all your active inventory at your custom store link.
            </p>
            {profile?.slug && (
              <div className="p-2.5 bg-slate-800 rounded-xl text-xs font-mono text-emerald-300 break-all border border-slate-700 select-all">
                /stores/{profile.slug}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 cols: Edit Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Cover Image / Banner */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-800">
                  Store Cover Banner
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Recommended: 1200 × 400px (max 5MB)
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 group hover:border-emerald-500 transition-colors">
                {coverPreview ? (
                  <div className="relative h-36 sm:h-44 w-full">
                    <img
                      src={coverPreview}
                      alt="Store Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white/95 text-slate-800 font-bold text-xs rounded-xl shadow-lg hover:bg-white transition-all">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Change Cover Banner</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="h-36 sm:h-44 w-full flex flex-col items-center justify-center cursor-pointer p-4 hover:bg-slate-100/60 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      Upload Store Cover Banner
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Displays across the top background of your public storefront
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Store Logo */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Store Logo / Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt={storeName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-8 h-8 text-slate-400" />
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
                    Upload a high-quality logo (JPEG, PNG, WEBP max 2MB).
                  </p>
                </div>
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Store Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Fashion Hub"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
              />
            </div>

            {/* Merchant Contact Phone */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Business Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01700000000"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Store Description */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Store Bio / Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your brand values, specialization, return policies, and customer care commitments..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
              />
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Store Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerSettings;
