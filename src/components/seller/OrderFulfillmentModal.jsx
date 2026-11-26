import React, { useState } from 'react';
import {
  X,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  ExternalLink,
} from 'lucide-react';
import sellerService from '../../services/sellerService';
import { formatPrice, formatDate } from '../../utils/formatters';

/**
 * OrderFulfillmentModal Component
 * Dialog allowing merchants to inspect customer delivery address, contact info,
 * update SubOrder delivery status, and attach courier tracking numbers.
 *
 * @param {Object} props
 * @param {Object} props.subOrder - SubOrder details
 * @param {Function} props.onClose - Modal close handler
 * @param {Function} props.onSuccess - Callback on successful status update
 */
const OrderFulfillmentModal = ({ subOrder, onClose, onSuccess }) => {
  const [status, setStatus] = useState(subOrder?.status || 'pending');
  const [trackingNumber, setTrackingNumber] = useState(subOrder?.tracking_number || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!subOrder) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        status,
        tracking_number: trackingNumber.trim(),
      };
      await sellerService.updateOrderStatus(subOrder.id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update sub-order status:', err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to update sub-order status.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Fulfill SubOrder</h3>
              <p className="text-xs text-slate-500 font-mono">
                ID: {String(subOrder.id).slice(0, 18)}...
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer & Shipping Information Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Delivery Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-bold truncate">{subOrder.buyer_name || 'Customer'}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-semibold">{subOrder.buyer_phone || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700 sm:col-span-2">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{subOrder.buyer_email || 'N/A'}</span>
              </div>

              <div className="sm:col-span-2 p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 font-medium">
                <p className="text-[11px] text-slate-400 font-bold uppercase mb-0.5">
                  Shipping Address
                </p>
                <p className="text-xs leading-relaxed">{subOrder.buyer_address || 'Address provided at checkout'}</p>
              </div>
            </div>
          </div>

          {/* SubOrder Items List */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Items in this Package
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {Array.isArray(subOrder.items) && subOrder.items.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{item.product_name}</p>
                    <p className="text-slate-500 text-[11px]">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-extrabold text-slate-900">
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              ))}

              <div className="p-3 bg-slate-50 flex items-center justify-between text-xs font-bold border-t border-slate-200">
                <span className="text-slate-600">Subtotal:</span>
                <span className="text-slate-900 text-sm">{formatPrice(subOrder.subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment Status Update Form */}
          <form id="fulfillment-form" onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            {/* Status Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Update Fulfillment Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="pending">Pending (Awaiting seller confirmation)</option>
                <option value="confirmed">Confirmed (Order accepted & packaging)</option>
                <option value="shipped">Shipped (Handed over to courier)</option>
                <option value="delivered">Delivered (Customer received package)</option>
                <option value="canceled">Canceled (Cannot fulfill)</option>
              </select>
            </div>

            {/* Tracking Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Courier Tracking Number (Optional)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. TRK-88997766, REDX-123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The buyer can track their parcel status using this code in their order history.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="fulfillment-form"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Status...</span>
              </>
            ) : (
              <span>Save & Update Customer</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFulfillmentModal;
