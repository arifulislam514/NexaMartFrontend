import React from 'react';
import { ShieldCheck, Lock, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import productService from '../../services/productService';

/**
 * OrderSummary Component
 * Order breakdown card displaying line items, shipping estimate, VAT inclusion, and checkout trigger.
 * Strictly adheres to nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {Array} props.items - Cart items
 * @param {number} props.subtotal - Subtotal amount in BDT
 * @param {number} [props.shipping=15] - Shipping fee in BDT
 * @param {Function} props.onPlaceOrder - Order placement callback
 * @param {boolean} [props.loading=false] - Submission loading state
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className='']
 */
const OrderSummary = ({
  items = [],
  subtotal = 0,
  shipping = 15,
  onPlaceOrder,
  loading = false,
  disabled = false,
  className = '',
}) => {
  const finalShipping = subtotal > 0 ? shipping : 0;
  const grandTotal = subtotal + finalShipping;
  const itemCount = items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24 ${className}`}
    >
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-900">Order Summary</h3>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Cart Items Thumbnail List */}
      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mb-6 pr-1 space-y-2">
        {items.map((item) => {
          const product = item.product || {};
          const itemImg = productService.getProductImage(product);
          const lineTotal =
            item.total_price !== undefined
              ? Number(item.total_price)
              : Number(product.price || 0) * (item.quantity || 1);

          return (
            <div key={item.id} className="pt-2 first:pt-0 flex items-center gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                <img
                  src={itemImg}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                  {product.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Qty: {item.quantity} &times; {formatPrice(product.price)}
                </p>
              </div>
              <div className="text-right font-bold text-xs sm:text-sm text-slate-900">
                {formatPrice(lineTotal)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cost Calculations */}
      <div className="space-y-3 mb-6 text-sm border-t border-slate-100 pt-4">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Shipping Fee</span>
          <span className="font-semibold text-slate-900">
            {finalShipping === 0 ? 'Free' : formatPrice(finalShipping)}
          </span>
        </div>

        <div className="flex justify-between text-xs text-slate-400">
          <span>Standard VAT (15%)</span>
          <span>Included in price</span>
        </div>

        <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
          <span className="text-base font-bold text-slate-900">Total to Pay</span>
          <span className="text-2xl font-black text-indigo-600">
            {formatPrice(grandTotal)}
          </span>
        </div>
      </div>

      {/* Place Order CTA Button */}
      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={loading || disabled || items.length === 0}
        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
        aria-label="Confirm & Place Order"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Placing Order...</span>
          </>
        ) : (
          <>
            <span>Confirm & Place Order</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Trust & Guarantees */}
      <div className="space-y-2 text-xs text-slate-500 pt-3 border-t border-slate-100 text-center">
        <div className="flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>Cash on Delivery & 30-Day Easy Returns</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
