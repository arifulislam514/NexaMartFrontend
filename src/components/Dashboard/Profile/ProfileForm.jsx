import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import ProfileButtons from './ProfileButtons';
import { formatDate } from '../../../utils/formatters';

/**
 * ProfileForm Component
 * Manages viewing and editing user profile details (first_name, last_name, phone_number, address)
 * with strict adherence to API_DOCUMENTATION.md Section 2.1 (PATCH /auth/users/me/).
 *
 * @param {Object} props
 * @param {Object} [props.user] - Optional user override (defaults to AuthContext user)
 * @param {Function} [props.onSubmit] - Custom submission handler: (data) => Promise<void>
 * @param {Function} [props.onSuccess] - Callback when profile is successfully updated
 * @param {Function} [props.onPasswordClick] - Optional trigger to switch to Password Change
 * @param {string} [props.className='']
 */
const ProfileForm = ({
  user: propUser,
  onSubmit,
  onSuccess,
  onPasswordClick,
  className = '',
}) => {
  const { user: authUser, updateProfile, logout } = useAuth();
  const currentUser = propUser || authUser;

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
  });

  // Track initial data to detect changes
  const [initialData, setInitialData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Sync form values whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      const initial = {
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        phone_number: currentUser.phone_number || '',
        address: currentUser.address || '',
      };
      setFormData(initial);
      setInitialData(initial);
      setValidationErrors({});
    }
  }, [currentUser]);

  // Compute whether form has unsaved modifications
  const isDirty = useMemo(() => {
    return (
      formData.first_name !== initialData.first_name ||
      formData.last_name !== initialData.last_name ||
      formData.phone_number !== initialData.phone_number ||
      formData.address !== initialData.address
    );
  }, [formData, initialData]);

  // Handle Input Changes
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field validation error when edited
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  // Discard changes and revert to initial state
  const handleReset = () => {
    setFormData(initialData);
    setValidationErrors({});
    setErrorMessage(null);
  };

  // Client-side Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required.';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required.';
    }

    // Bangladeshi phone number pattern: 013-019 followed by 8 digits, or general 11 digits
    if (formData.phone_number.trim()) {
      const cleanedPhone = formData.phone_number.trim().replace(/[- ]/g, '');
      const bdPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
      if (!bdPhoneRegex.test(cleanedPhone) && cleanedPhone.length !== 11) {
        errors.phone_number =
          'Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX).';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone_number: formData.phone_number.trim(),
      address: formData.address.trim(),
    };

    try {
      let result;
      if (onSubmit) {
        result = await onSubmit(payload);
      } else {
        result = await updateProfile(payload);
      }

      // Update initial data baseline
      setInitialData(payload);
      setSuccessMessage('Profile details updated successfully!');

      if (onSuccess) {
        onSuccess(result);
      }

      // Auto dismiss success toast after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const respData = err.response?.data;
      if (typeof respData === 'object' && respData !== null) {
        const fieldErrors = {};
        let generalMsg = '';
        Object.entries(respData).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val.join(' ') : String(val);
          if (['first_name', 'last_name', 'phone_number', 'address'].includes(key)) {
            fieldErrors[key] = msg;
          } else {
            generalMsg += `${key}: ${msg} `;
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          setValidationErrors(fieldErrors);
        }
        setErrorMessage(
          generalMsg.trim() ||
            respData.detail ||
            'Failed to update profile. Please verify your entries.'
        );
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred while saving.');
      }
    } finally {
      setSaving(false);
    }
  };

  // User display name & role
  const fullName = [currentUser?.first_name, currentUser?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
  const displayName = fullName || currentUser?.name || currentUser?.email || 'User';
  const initialLetter = (displayName.charAt(0) || 'U').toUpperCase();
  const isAdmin = Boolean(currentUser?.is_staff || currentUser?.role === 'admin');

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden ${className}`}
    >
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
          {/* Avatar Initial */}
          <div className="w-20 h-20 bg-indigo-500/20 border-2 border-indigo-400/40 text-indigo-300 rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg backdrop-blur-xs flex-shrink-0">
            {initialLetter}
          </div>

          {/* User Info & Badges */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
                {displayName}
              </h2>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Admin Staff</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Customer</span>
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 font-medium mb-2 truncate">
              {currentUser?.email}
            </p>

            {currentUser?.date_joined && (
              <p className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Member since {formatDate(currentUser.date_joined, { format: 'medium' })}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-2xl flex items-center justify-between shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-2xl flex items-center justify-between shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Unsaved Changes Notification Pill */}
        {isDirty && !successMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>You have unsaved changes. Don&apos;t forget to click &quot;Save Changes&quot; below.</span>
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="space-y-5">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* First Name */}
            <div>
              <label
                htmlFor="profile-first-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
              >
                First Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="profile-first-name"
                  value={formData.first_name}
                  onChange={handleChange('first_name')}
                  disabled={saving}
                  placeholder="e.g. Rahim"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.first_name
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
              </div>
              {validationErrors.first_name && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {validationErrors.first_name}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="profile-last-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
              >
                Last Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="profile-last-name"
                  value={formData.last_name}
                  onChange={handleChange('last_name')}
                  disabled={saving}
                  placeholder="e.g. Uddin"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.last_name
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
              </div>
              {validationErrors.last_name && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {validationErrors.last_name}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Email (Read-only) & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Email Address (Immutable) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="profile-email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  Email Address
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Lock className="w-3 h-3" />
                  <span>Account ID</span>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="profile-email"
                  value={currentUser?.email || ''}
                  disabled
                  readOnly
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium cursor-not-allowed select-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400 leading-tight">
                Email is tied to your login identity and cannot be edited.
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="profile-phone"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  id="profile-phone"
                  value={formData.phone_number}
                  onChange={handleChange('phone_number')}
                  disabled={saving}
                  placeholder="e.g. 01712345678"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.phone_number
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
              </div>
              {validationErrors.phone_number ? (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {validationErrors.phone_number}
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-400 leading-tight">
                  Used for order tracking notifications and delivery verification.
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Delivery Address */}
          <div>
            <label
              htmlFor="profile-address"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
            >
              Default Delivery Address
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <textarea
                id="profile-address"
                rows={3}
                value={formData.address}
                onChange={handleChange('address')}
                disabled={saving}
                placeholder="House, Road, Area/Thana, District/City..."
                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all resize-y ${
                  validationErrors.address
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
            </div>
            {validationErrors.address ? (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {validationErrors.address}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] text-slate-400 leading-tight">
                This address will automatically pre-fill your checkout form.
              </p>
            )}
          </div>
        </div>

        {/* Profile Action Buttons */}
        <ProfileButtons
          loading={saving}
          isDirty={isDirty}
          onReset={handleReset}
          showQuickLinks={true}
          onPasswordClick={onPasswordClick}
          onLogout={logout}
        />
      </form>
    </div>
  );
};

export default ProfileForm;
