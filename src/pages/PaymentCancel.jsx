import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';

/**
 * PaymentCancel Page
 * Rendered when the user deliberately cancels or leaves the payment gateway checkout.
 */
const PaymentCancel = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10 text-center">
        {/* Warning / Cancellation Graphic */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20 ring-8 ring-amber-50 animate-scale-up">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
          Payment Process Cancelled
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
          You cancelled the online checkout process. Your order has not been placed and no charge has been made.
        </p>

        {/* Cart Reminder Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 mb-8 text-left max-w-xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Your items are still saved
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                All products in your cart remain saved. You can resume checkout at any time or select Cash on Delivery if you prefer paying when the package arrives.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to="/checkout"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Resume Checkout</span>
          </Link>

          <Link
            to="/cart"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-3.5 rounded-xl font-semibold text-base transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
        </div>

        {/* Safe Guarantee */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Guaranteed secure and encrypted shopping experience</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
