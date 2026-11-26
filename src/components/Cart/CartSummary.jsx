import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, ArrowRight, Loader2, Tag } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import useAuth from '../../hooks/useAuth';
import CouponApplyBox from '../Common/CouponApplyBox';

/**
 * CartSummary Component
 * Displays subtotal, coupon discount, shipping estimates, VAT notation, grand total, and checkout CTA.
 * Strictly adheres to nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {number} props.subtotal - Subtotal amount in BDT
 * @param {number} [props.itemCount=0] - Total count of units in cart
 * @param {number} [props.shipping=15] - Estimated shipping fee in BDT
 * @param {boolean} [props.loading=false] - Loading spinner on checkout
 * @param {Function} [props.onCheckout] - Custom checkout callback override
 * @param {string} [props.className='']
 */
const CartSummary = ({
  subtotal = 0,
  itemCount = 0,
  shipping = 15,
  loading = false,
  onCheckout,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const discountAmount = appliedCoupon?.discount_amount ? Number(appliedCoupon.discount_amount) : 0;
  const finalShipping = subtotal > 0 ? shipping : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount) + finalShipping;

  const handleCheckoutClick = () => {
    if (onCheckout) {
      onCheckout();
      return;
    }

    if (user) {
      navigate('/checkout', { state: { appliedCoupon } });
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24 ${className}`}>
      <h3 className="text-xl font-bold text-slate-900 mb-6">
        Order Summary
      </h3>

      {/* Coupon Application Section */}
      <div className="mb-6 pb-6 border-b border-slate-100">
        <CouponApplyBox
          cartAmount={subtotal}
          appliedCoupon={appliedCoupon}
          onCouponApplied={(c) => setAppliedCoupon(c)}
        />
      </div>

      <div className="space-y-4 mb-6 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between text-slate-600">
          <span>
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-semibold text-slate-900">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* Applied Coupon Discount */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold animate-fade-in">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Coupon Discount ({appliedCoupon.code})
            </span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        {/* Shipping Estimate */}
        <div className="flex justify-between text-slate-600">
          <span>Shipping Estimate</span>
          <span className="font-semibold text-slate-900">
            {finalShipping === 0 ? 'Free' : formatPrice(finalShipping)}
          </span>
        </div>

        {/* VAT Notation */}
        <div className="flex justify-between text-xs text-slate-400">
          <span>Estimated VAT (15%)</span>
          <span>Included in price</span>
        </div>

        {/* Grand Total */}
        <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
          <span className="text-base font-bold text-slate-900">
            Total Order
          </span>
          <span className="text-2xl font-extrabold text-indigo-600">
            {formatPrice(grandTotal)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        type="button"
        onClick={handleCheckoutClick}
        disabled={loading || itemCount === 0}
        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2 cursor-pointer"
        aria-label="Proceed to Checkout"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Trust Badges */}
      <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Secure Multi-Vendor SSL Checkout</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
          <span>Encrypted Payment & Cash on Delivery Available</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
