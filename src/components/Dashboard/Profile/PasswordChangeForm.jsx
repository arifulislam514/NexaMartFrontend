import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  X,
  Check,
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth';

/**
 * PasswordChangeForm Component
 * Securely updates authenticated user password via Djoser's POST /api/v1/auth/users/set_password/.
 * Includes strength meter, visibility toggles, and live client-side validation.
 *
 * @param {Object} props
 * @param {Function} [props.onSuccess] - Callback fired on successful password update
 * @param {Function} [props.onCancel] - Optional cancel handler
 * @param {string} [props.className='']
 */
const PasswordChangeForm = ({
  onSuccess,
  onCancel,
  className = '',
}) => {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Password strength evaluation
  const strength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-slate-200' };

    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1;
    if (/\d/.test(newPassword)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
      default:
        return { score: 10, label: 'Too short', color: 'bg-rose-400', text: 'text-rose-500' };
    }
  }, [newPassword]);

  // Client-side Validation
  const validate = () => {
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = 'Enter your current password.';
    }

    if (!newPassword) {
      errors.newPassword = 'Enter a new password.';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long.';
    } else if (newPassword === currentPassword) {
      errors.newPassword = 'New password cannot be the same as your current password.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      // Reset form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setValidationErrors({});

      setSuccessMessage('Your password has been changed successfully!');

      if (onSuccess) {
        onSuccess();
      }

      // Auto dismiss success after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Password change error:', err);
      const msg =
        err.message ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.current_password?.[0] ||
        err.response?.data?.detail ||
        'Failed to change password. Please ensure your current password is correct.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setValidationErrors({});
    setErrorMessage(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-100">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Change Password
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your account password to keep your profile secure
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-2xl flex items-center justify-between shadow-2xs animate-fade-in">
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
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-2xl flex items-center justify-between shadow-2xs animate-fade-in">
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

      {/* Password Change Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Password Field */}
        <div>
          <label
            htmlFor="current-password"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
          >
            Current Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showCurrent ? 'text' : 'password'}
              id="current-password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (validationErrors.currentPassword) {
                  setValidationErrors((prev) => ({ ...prev, currentPassword: null }));
                }
              }}
              disabled={loading}
              placeholder="Enter your current password"
              className={`w-full pl-10 pr-11 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                validationErrors.currentPassword
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {validationErrors.currentPassword && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {validationErrors.currentPassword}
            </p>
          )}
        </div>

        {/* New Password Field */}
        <div>
          <label
            htmlFor="new-password"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
          >
            New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showNew ? 'text' : 'password'}
              id="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (validationErrors.newPassword) {
                  setValidationErrors((prev) => ({ ...prev, newPassword: null }));
                }
              }}
              disabled={loading}
              placeholder="At least 8 characters"
              className={`w-full pl-10 pr-11 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                validationErrors.newPassword
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNew((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {validationErrors.newPassword && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {validationErrors.newPassword}
            </p>
          )}

          {/* Password Strength Meter */}
          {newPassword && (
            <div className="mt-2.5 space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Password strength:</span>
                <span className={`font-bold ${strength.text}`}>{strength.label}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
          >
            Confirm New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showConfirm ? 'text' : 'password'}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (validationErrors.confirmPassword) {
                  setValidationErrors((prev) => ({ ...prev, confirmPassword: null }));
                }
              }}
              disabled={loading}
              placeholder="Re-enter your new password"
              className={`w-full pl-10 pr-11 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                validationErrors.confirmPassword
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Requirements Checklist */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600">
          <span className="font-bold text-slate-700 block">Password Requirements:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  newPassword.length >= 8
                    ? 'bg-emerald-100 text-emerald-700 font-bold'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                ✓
              </div>
              <span>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
                    ? 'bg-emerald-100 text-emerald-700 font-bold'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                ✓
              </div>
              <span>Uppercase & lowercase</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  /\d/.test(newPassword)
                    ? 'bg-emerald-100 text-emerald-700 font-bold'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                ✓
              </div>
              <span>At least one number</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  confirmPassword && newPassword === confirmPassword
                    ? 'bg-emerald-100 text-emerald-700 font-bold'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                ✓
              </div>
              <span>Passwords match</span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          {(onCancel || currentPassword || newPassword || confirmPassword) && (
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all shadow-sm ${
              loading || !currentPassword || !newPassword || !confirmPassword
                ? 'bg-indigo-400 cursor-not-allowed opacity-70'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 cursor-pointer shadow-indigo-100'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;
