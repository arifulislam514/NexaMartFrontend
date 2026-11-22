import React, { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Printer,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import { formatPrice, formatDateTime } from '../utils/formatters';

/**
 * PaymentSuccess Page
 * Rendered after successful online payment transaction.
 * Reads transaction & order details from query parameters or state.
 */
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract payment callback parameters
  const tranId =
    searchParams.get('tran_id') ||
    searchParams.get('transaction_id') ||
    searchParams.get('val_id') ||
    `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const orderId =
    searchParams.get('order_id') ||
    searchParams.get('id') ||
    searchParams.get('cart_id') ||
    'ORD-CONFIRMED';

  const amount = searchParams.get('amount') || searchParams.get('total') || null;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10 text-center">
        {/* Animated Celebration Icon */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20 ring-8 ring-emerald-50 animate-scale-up">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
        </div>

        {/* Heading */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-3 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Payment Verified & Confirmed</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
          Thank You for Your Order!
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
          Your payment was successfully received and your order has been placed. We are already preparing it for delivery.
        </p>

        {/* Transaction Summary Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 mb-8 text-left max-w-xl mx-auto shadow-2xs divide-y divide-slate-200/70">
          <div className="flex justify-between items-center pb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Transaction ID
            </span>
            <span className="font-mono text-sm font-bold text-slate-900 truncate max-w-[200px]">
              {tranId}
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Order Reference
            </span>
            <span className="font-mono text-sm font-bold text-indigo-600">
              #{orderId.slice(0, 12)}
            </span>
          </div>

          {amount && (
            <div className="flex justify-between items-center py-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Amount Paid
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {formatPrice(amount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Payment Status
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Paid
            </span>
          </div>

          <div className="flex justify-between items-center pt-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Date & Time
            </span>
            <span className="text-xs font-medium text-slate-700">
              {formatDateTime(new Date())}
            </span>
          </div>
        </div>

        {/* Delivery Milestone Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-8 text-left text-xs">
          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
            <Truck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Doorstep Dispatch</p>
              <p className="text-slate-500 mt-0.5">
                Standard delivery within 2-3 working days across Bangladesh.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Buyer Protection</p>
              <p className="text-slate-500 mt-0.5">
                Every purchase includes 30-day money-back satisfaction guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to="/orders"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            <Package className="w-5 h-5" />
            <span>Track My Order</span>
          </Link>

          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-3.5 rounded-xl font-semibold text-base transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Print Receipt Link */}
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors print:hidden"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt / Tax Invoice</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
