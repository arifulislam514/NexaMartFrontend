import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Eye, AlertCircle, Copy, Check, Loader2, Truck, Store } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_TRACKER_STEPS, ORDER_STATUS } from '../../utils/constants';
import orderService from '../../services/orderService';
import productService from '../../services/productService';

/**
 * OrderCard Component
 * Displays individual customer order with header metadata, interactive visual tracker,
 * items list, and quick actions (view details, cancel order).
 * Strictly adheres to nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {Object} props.order - Formatted order object
 * @param {Function} [props.onViewDetails] - (order) => void
 * @param {Function} [props.onCancelOrder] - (orderId) => Promise<void>
 * @param {string} [props.className='']
 */
const OrderCard = ({
  order,
  onViewDetails,
  onCancelOrder,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!order) return null;

  const orderDate = order.created_at || order.date;
  const items = Array.isArray(order.items) ? order.items : [];
  const isCanceled = order.status === ORDER_STATUS.CANCELED;
  const canCancel = orderService.canCancel(order);

  // Compute tracker progress index
  const activeStepIndex = ORDER_TRACKER_STEPS.indexOf(order.status);
  const progressPercent =
    isCanceled
      ? 0
      : activeStepIndex >= 0
      ? (activeStepIndex / (ORDER_TRACKER_STEPS.length - 1)) * 100
      : 0;

  const handleCopyOrderId = (e) => {
    e.stopPropagation();
    if (order.id) {
      navigator.clipboard?.writeText(String(order.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelClick = async () => {
    if (!onCancelOrder || cancelling) return;
    if (
      window.confirm(
        'Are you sure you want to cancel this order? This action cannot be undone.'
      )
    ) {
      setCancelling(true);
      try {
        await onCancelOrder(order.id);
      } finally {
        setCancelling(false);
      }
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-slate-300 transition-all ${className}`}
    >
      {/* 1. Header Bar */}
      <div className="bg-slate-50 p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Order Placed
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {formatDate(orderDate, { format: 'medium' })}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Total Amount
            </p>
            <p className="text-sm font-extrabold text-slate-900">
              {formatPrice(order.total_price)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Order ID
            </p>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="text-sm font-mono font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors group/id"
              title="Click to copy full order UUID"
            >
              <span>#{String(order.id).slice(0, 8)}&hellip;</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover/id:text-indigo-600" />
              )}
            </button>
          </div>
        </div>

        <div>
          <OrderStatusBadge status={order.status} showDot={true} size="md" />
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* 2. Visual Fulfillment Tracker */}
        <div className="mb-8 pt-2">
          {isCanceled ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-sm">
              <XCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span className="font-medium">
                This order was canceled and is no longer being processed.
              </span>
            </div>
          ) : (
            <div className="relative">
              {/* Tracker Track Background */}
              <div className="absolute left-0 top-4 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full" />
              {/* Active Progress Fill */}
              <div
                className="absolute left-0 top-4 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Milestone Dots */}
              <div className="relative flex justify-between">
                {ORDER_TRACKER_STEPS.map((step, idx) => {
                  const isCompleted = activeStepIndex >= idx;
                  const isCurrent = activeStepIndex === idx;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors ${
                          isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                        } ${isCurrent ? 'ring-2 ring-emerald-500/40 ring-offset-1' : ''}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs font-bold text-slate-500">{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium hidden sm:block ${
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
          )}
        </div>

        {/* 3. Items Snapshot List */}
        <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2 mb-6">
          {items.map((item, idx) => {
            const product = item.product || {};
            const imgUrl = productService.getProductImage(product);
            const lineTotal =
              item.total_price !== undefined
                ? Number(item.total_price)
                : Number(item.price || product.price || 0) * (item.quantity || 1);

            return (
              <div key={idx} className="flex items-center gap-4 py-3 first:pt-2">
                <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200/80">
                  <img
                    src={imgUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Qty: {item.quantity} &bull; {formatPrice(item.price || product.price)} each
                  </p>
                </div>

                <div className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {formatPrice(lineTotal)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-Vendor Packages Breakdown */}
        {Array.isArray(order.sub_orders) && order.sub_orders.length > 0 && (
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Merchant Packages ({order.sub_orders.length})</span>
              </span>
              <span className="text-[11px] text-slate-400">Shipped directly by independent sellers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {order.sub_orders.map((sub) => {
                const subStatus = (sub.status || '').toLowerCase();
                const badgeClass =
                  subStatus === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : subStatus === 'shipped'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : subStatus === 'confirmed'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : subStatus === 'canceled'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <div
                    key={sub.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <Link
                        to={sub.seller_slug ? `/stores/${sub.seller_slug}` : '#'}
                        className="font-bold text-slate-900 text-xs hover:text-indigo-600 transition-colors block truncate"
                      >
                        {sub.seller_store_name || 'Merchant'}
                      </Link>
                      {sub.tracking_number ? (
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                          Tracking: <span className="font-semibold text-slate-800">{sub.tracking_number}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">Tracking code pending</p>
                      )}
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border capitalize shrink-0 ${badgeClass}`}
                    >
                      {sub.status || 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Action Buttons Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Payment: <span className="text-slate-800 font-semibold">Cash on Delivery</span>
          </div>

          <div className="flex items-center gap-3">
            {canCancel && onCancelOrder && (
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={cancelling}
                className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Cancel Order</span>
                )}
              </button>
            )}

            {onViewDetails && (
              <button
                type="button"
                onClick={() => onViewDetails(order)}
                className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
              >
                <Eye className="w-4 h-4" />
                <span>View Invoice Details</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
