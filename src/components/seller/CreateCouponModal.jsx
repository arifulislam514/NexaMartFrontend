import React, { useState } from 'react';
import {
  X,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import sellerService from '../../services/sellerService';
import { CURRENCY_SYMBOL } from '../../utils/formatters';

/**
 * CreateCouponModal Component
 * Dialog allowing sellers to create discount codes for their store.
 *
 * @param {Object} props
 * @param {Function} props.onClose - Modal close handler
 * @param {Function} props.onSuccess - Callback after coupon created
 */
const CreateCouponModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent', // 'percent' | 'fixed'
    discount_value: '',
    min_purchase: '0.00',
    valid_from: new Date().toISOString().slice(0, 16),
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    active: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.discount_value) {
      setError('Coupon code and discount value are required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        code: formData.code.trim().toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_purchase: parseFloat(formData.min_purchase || 0),
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_to: new Date(formData.valid_to).toISOString(),
        active: formData.active,
      };

      await sellerService.createCoupon(payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create coupon:', err);
      const detail =
        err.response?.data?.code?.[0] ||
        err.response?.data?.discount_value?.[0] ||
        err.response?.data?.detail ||
        'Failed to create coupon. Please check your inputs.';
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Create Store Coupon</h3>
              <p className="text-xs text-slate-500">Run a custom promotional discount code.</p>
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
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="create-coupon-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Coupon Code */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Coupon Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SUMMER20, WELCOME100"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            {/* Discount Type and Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Discount Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ({CURRENCY_SYMBOL})</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Discount Value <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === 'percent' ? '20%' : '150.00'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Minimum Purchase */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Minimum Cart Purchase ({CURRENCY_SYMBOL})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.min_purchase}
                onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                placeholder="1000.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Coupon applies only if the order exceeds this subtotal.
              </p>
            </div>

            {/* Validity Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Valid From</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Valid Until</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.valid_to}
                  onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="coupon-active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="coupon-active" className="text-xs font-bold text-slate-800 cursor-pointer">
                Activate coupon immediately
              </label>
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
            form="create-coupon-form"
            disabled={saving}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Coupon...</span>
              </>
            ) : (
              <span>Create Coupon</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCouponModal;
