import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Copy,
  Check,
  Calendar,
  Percent,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';
import sellerService from '../../services/sellerService';
import CreateCouponModal from '../../components/seller/CreateCouponModal';
import { formatPrice, formatDate, CURRENCY_SYMBOL } from '../../utils/formatters';

/**
 * SellerCoupons Page
 * Allows merchants to inspect, manage, and create discount coupons for their store.
 * Path: /seller/coupons
 */
const SellerCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sellerService.getCoupons();
      const list = Array.isArray(data) ? data : data?.results || [];
      setCoupons(list);
    } catch (err) {
      console.error('Failed to load seller coupons:', err);
      setError('Failed to load store coupons.');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Copy code to clipboard
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Delete coupon
  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;

    setDeletingId(id);
    try {
      await sellerService.deleteCoupon(id);
      setFeedback({ type: 'success', message: `Coupon "${code}" deleted.` });
      await fetchCoupons();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      setFeedback({ type: 'error', message: 'Failed to delete coupon.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Discount Coupons
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create promotional coupon codes to reward customers and boost your store's sales.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-amber-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center gap-3 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Coupons Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading coupons...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-16 text-center">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No coupons created yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Create your first discount code (like 10% off or ৳100 discount) to attract more buyers.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Coupon Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min. Purchase</th>
                  <th className="py-3.5 px-4">Validity Window</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => {
                  const now = new Date();
                  const validFrom = new Date(c.valid_from);
                  const validTo = new Date(c.valid_to);
                  const isExpired = now > validTo;
                  const isFuture = now < validFrom;
                  const isLive = c.active && !isExpired && !isFuture;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Code */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(c.code)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                        {c.discount_type === 'percent' ? (
                          <span className="text-emerald-700">{c.discount_value}% OFF</span>
                        ) : (
                          <span className="text-indigo-700">
                            {CURRENCY_SYMBOL}
                            {Number(c.discount_value).toFixed(2)} OFF
                          </span>
                        )}
                      </td>

                      {/* Minimum Purchase */}
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {Number(c.min_purchase) > 0 ? formatPrice(c.min_purchase) : 'No minimum'}
                      </td>

                      {/* Validity Period */}
                      <td className="py-4 px-4 text-slate-500">
                        <p className="font-medium">
                          From: {formatDate(c.valid_from, { format: 'short' })}
                        </p>
                        <p className="font-medium text-[11px] text-slate-400">
                          Until: {formatDate(c.valid_to, { format: 'short' })}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                            Expired
                          </span>
                        ) : isFuture ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Upcoming
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Delete Action */}
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.code)}
                          disabled={deletingId === c.id}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Coupon"
                        >
                          {deletingId === c.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <CreateCouponModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            fetchCoupons();
            setFeedback({ type: 'success', message: 'New coupon created successfully!' });
            setTimeout(() => setFeedback(null), 3000);
          }}
        />
      )}
    </div>
  );
};

export default SellerCoupons;
