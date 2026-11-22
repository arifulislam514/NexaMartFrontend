import React from 'react';
import { X, Printer, Package, ShieldCheck, CheckCircle2, Copy } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_TRACKER_STEPS, ORDER_STATUS } from '../../utils/constants';
import productService from '../../services/productService';

/**
 * OrderDetailsModal Component
 * Full-screen modal popup displaying printable order invoice details, items list,
 * delivery destination, and fulfillment status tracker.
 *
 * @param {Object} props
 * @param {Object} props.order - Selected order object
 * @param {Function} props.onClose - Modal dismissal handler
 * @param {Function} [props.onCancelOrder] - Optional order cancellation callback
 */
const OrderDetailsModal = ({ order, onClose, onCancelOrder }) => {
  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const isCanceled = order.status === ORDER_STATUS.CANCELED;
  const activeStepIndex = ORDER_TRACKER_STEPS.indexOf(order.status);
  const progressPercent =
    isCanceled
      ? 0
      : activeStepIndex >= 0
      ? (activeStepIndex / (ORDER_TRACKER_STEPS.length - 1)) * 100
      : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-order-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-up my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2
                id="modal-order-title"
                className="text-xl sm:text-2xl font-black text-slate-900"
              >
                Invoice #{String(order.id).slice(0, 8)}
              </h2>
              <OrderStatusBadge status={order.status} showDot={true} size="md" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Order placed on {formatDate(order.created_at || order.date, { format: 'long' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors print:hidden"
              title="Print Invoice"
              aria-label="Print Invoice"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visual Progress Tracker (Customer) */}
        {!isCanceled && (
          <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="relative pt-2">
              <div className="absolute left-0 top-3.5 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full" />
              <div
                className="absolute left-0 top-3.5 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />

              <div className="relative flex justify-between">
                {ORDER_TRACKER_STEPS.map((step, idx) => {
                  const isCompleted = activeStepIndex >= idx;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-xs z-10 ${
                          isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] mt-1.5 font-medium hidden sm:block ${
                          isCompleted ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Items Table */}
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Purchased Items ({items.length})
          </h3>

          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {items.map((item, idx) => {
              const product = item.product || {};
              const imgUrl = productService.getProductImage(product);
              const lineTotal =
                item.total_price !== undefined
                  ? Number(item.total_price)
                  : Number(item.price || product.price || 0) * (item.quantity || 1);

              return (
                <div key={idx} className="p-3.5 sm:p-4 flex items-center gap-3.5">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                    <img
                      src={imgUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatPrice(item.price || product.price)} &times; {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">
                    {formatPrice(lineTotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="mt-6 p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">
              {formatPrice(order.total_price)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span className="font-semibold text-emerald-600">Included</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>VAT (15%)</span>
            <span>Inclusive</span>
          </div>
          <div className="border-t border-slate-200 pt-2.5 flex justify-between items-baseline font-black">
            <span className="text-base text-slate-900">Total Paid / Due</span>
            <span className="text-2xl text-indigo-600">
              {formatPrice(order.total_price)}
            </span>
          </div>
        </div>

        {/* Payment & Security Info */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Method: Cash on Delivery (COD)</span>
          </div>
          <span className="font-mono text-slate-400">UUID: {order.id}</span>
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
