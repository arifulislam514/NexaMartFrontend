import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  XCircle,
  RotateCcw,
  ShoppingBag,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Banknote,
} from 'lucide-react';

/**
 * PaymentFail Page
 * Rendered when an online payment gateway transaction fails or is declined.
 */
const PaymentFail = () => {
  const [searchParams] = useSearchParams();

  const errorMessage =
    searchParams.get('error') ||
    searchParams.get('message') ||
    'The transaction was declined by the bank or gateway timeout occurred.';

  const tranId = searchParams.get('tran_id') || searchParams.get('val_id') || null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10 text-center">
        {/* Error Graphic */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/20 ring-8 ring-rose-50 animate-scale-up">
          <XCircle className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
          Payment Unsuccessful
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
          We were unable to complete your payment transaction. Please don&apos;t worry &mdash; no money was deducted from your account.
        </p>

        {/* Error Details Card */}
        <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5 mb-8 text-left max-w-xl mx-auto">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-950 text-sm mb-1">
                Reason for Failure:
              </h4>
              <p className="text-sm text-rose-800 leading-relaxed">
                {errorMessage}
              </p>
              {tranId && (
                <p className="text-xs text-rose-600/80 mt-2 font-mono">
                  Ref: {tranId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Suggested Next Steps */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 mb-8 text-left max-w-xl mx-auto space-y-3">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            What you can do next:
          </h4>
          <ul className="text-sm text-slate-600 space-y-2.5 list-disc pl-5">
            <li>Check if your card has international/e-commerce transactions enabled.</li>
            <li>Ensure sufficient balance in your account or mobile wallet.</li>
            <li>
              Or choose <strong className="text-slate-800">Cash on Delivery (COD)</strong> to pay in cash upon receiving your package!
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to="/checkout"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Try Checkout Again</span>
          </Link>

          <Link
            to="/cart"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-3.5 rounded-xl font-semibold text-base transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Review Cart</span>
          </Link>
        </div>

        {/* Help text */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <HelpCircle className="w-4 h-4" />
          <span>Need help? Contact our 24/7 support at support@nexamart.com</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
