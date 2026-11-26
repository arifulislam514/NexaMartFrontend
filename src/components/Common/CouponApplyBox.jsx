import React, { useState } from 'react';
import { Tag, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import sellerService from '../../services/sellerService';
import { formatPrice } from '../../utils/formatters';

/**
 * CouponApplyBox Component
 * Reusable discount coupon validation box for Cart and Checkout pages.
 * Endpoint: POST /api/v1/coupons/validate/
 *
 * @param {Object} props
 * @param {number} props.cartAmount - Current cart subtotal
 * @param {Function} props.onCouponApplied - (couponData | null) => void
 * @param {Object} [props.appliedCoupon] - Current active coupon object if any
 * @param {string} [props.className='']
 */
const CouponApplyBox = ({
  cartAmount = 0,
  onCouponApplied,
  appliedCoupon = null,
  className = '',
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a coupon code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg('');

      const response = await sellerService.validateCoupon({
        code: code.trim().toUpperCase(),
        cart_amount: parseFloat(cartAmount),
      });

      if (response && response.valid) {
        if (onCouponApplied) {
          onCouponApplied(response);
        }
        setSuccessMsg(`Coupon "${response.code}" applied! You saved ${formatPrice(response.discount_amount)}`);
        setCode('');
      } else {
        setError(response?.detail || 'Invalid or expired coupon code.');
      }
    } catch (err) {
      console.error('Failed to validate coupon:', err);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Invalid or expired coupon code for this order.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (onCouponApplied) {
      onCouponApplied(null);
    }
    setSuccessMsg('');
    setError(null);
    setCode('');
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {appliedCoupon ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-extrabold text-emerald-900 font-mono">
                {appliedCoupon.code}
              </p>
              <p className="text-[11px] text-emerald-700">
                Discount: -{formatPrice(appliedCoupon.discount_amount)}
                {appliedCoupon.store_name && ` (${appliedCoupon.store_name})`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Remove Coupon"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Have a Promo Code / Store Coupon?
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="Enter coupon (e.g. SUMMER20)"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
            </button>
          </div>

          {error && (
            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-lg flex items-center gap-1.5 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CouponApplyBox;
