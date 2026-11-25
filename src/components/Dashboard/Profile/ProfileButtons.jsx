import React from 'react';
import { Link } from 'react-router-dom';
import {
  Save,
  RotateCcw,
  Loader2,
  Package,
  ShoppingCart,
  KeyRound,
  LogOut,
} from 'lucide-react';

/**
 * ProfileButtons Component
 * Action controls for profile forms (Save / Discard) with loading states and dirty tracking,
 * plus optional quick navigation shortcuts.
 *
 * @param {Object} props
 * @param {boolean} [props.loading=false] - Submission in progress
 * @param {boolean} [props.isDirty=false] - Whether form has unsaved modifications
 * @param {boolean} [props.disabled=false] - General disabled state
 * @param {Function} [props.onReset] - Callback when Discard Changes is clicked
 * @param {Function} [props.onSave] - Callback if triggered outside form submit
 * @param {string} [props.saveText='Save Changes']
 * @param {string} [props.resetText='Discard Changes']
 * @param {boolean} [props.showQuickLinks=false] - Whether to render quick navigation links
 * @param {Function} [props.onPasswordClick] - Optional callback to switch to password change
 * @param {Function} [props.onLogout] - Optional callback for logout
 * @param {string} [props.className='']
 */
const ProfileButtons = ({
  loading = false,
  isDirty = false,
  disabled = false,
  onReset,
  onSave,
  saveText = 'Save Changes',
  resetText = 'Discard Changes',
  showQuickLinks = false,
  onPasswordClick,
  onLogout,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary Form Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {/* Discard / Reset Button (Shown or enabled when dirty) */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={!isDirty || loading || disabled}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              isDirty && !loading && !disabled
                ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-95 shadow-2xs'
                : 'bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{resetText}</span>
          </button>
        )}

        {/* Save Changes Button */}
        <button
          type={onSave ? 'button' : 'submit'}
          onClick={onSave}
          disabled={loading || disabled || !isDirty}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all shadow-sm ${
            loading || disabled || !isDirty
              ? 'bg-indigo-400 cursor-not-allowed opacity-70'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 cursor-pointer shadow-indigo-100'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saveText}</span>
            </>
          )}
        </button>
      </div>

      {/* Optional Quick Navigation Shortcuts */}
      {showQuickLinks && (
        <div className="pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* View Orders */}
            <Link
              to="/orders"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs text-xs font-semibold"
            >
              <Package className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>My Orders</span>
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs text-xs font-semibold"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>View Cart</span>
            </Link>

            {/* Change Password */}
            {onPasswordClick ? (
              <button
                type="button"
                onClick={onPasswordClick}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 transition-colors shadow-2xs text-xs font-semibold text-left cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Password</span>
              </button>
            ) : null}

            {/* Logout */}
            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-700 transition-colors shadow-2xs text-xs font-semibold text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileButtons;
