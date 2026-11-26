import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Star,
  Trash2,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Filter,
  Store,
} from 'lucide-react';
import productService from '../../../services/productService';
import adminService from '../../../services/adminService';
import sellerService from '../../../services/sellerService';
import StarRating from '../../Common/StarRating';
import { formatDate } from '../../../utils/formatters';

/**
 * ManageReviews Component
 * Admin Review Moderation panel for inspecting and moderating customer reviews.
 * Strictly adheres to API_DOCUMENTATION.md Section 2.5 (/api/v1/products/{id}/reviews/).
 */
const ManageReviews = ({ className = '' }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'store' | 'product'
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [vendors, setVendors] = useState([]);

  // Deletion states
  const [deletingReview, setDeletingReview] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Fetch reviews across catalog and load vendors
  const fetchAllReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch sellers and products concurrently
      const [sellersRes, prodData] = await Promise.all([
        adminService.getSellers().catch(() => []),
        productService.getProducts({ page_size: 50 }),
      ]);

      const sellersList = Array.isArray(sellersRes) ? sellersRes : sellersRes?.results || [];
      setVendors(sellersList);

      const productList = Array.isArray(prodData) ? prodData : prodData?.results || [];

      // 1. Fetch store reviews for each seller
      const storeReviewPromises = sellersList.map(async (seller) => {
        try {
          const sRevs = await sellerService.getStoreReviews(seller.slug);
          const list = Array.isArray(sRevs) ? sRevs : sRevs?.results || [];
          return list.map((r) => ({
            ...r,
            type: 'store',
            sellerId: seller.id,
            sellerName: seller.store_name,
            sellerSlug: seller.slug,
            sellerLogo: seller.logo,
            targetName: `${seller.store_name} (Store)`,
          }));
        } catch {
          return [];
        }
      });

      // 2. Fetch product reviews across catalog
      const productReviewPromises = productList.map(async (prod) => {
        try {
          const revs = await productService.getProductReviews(prod.id);
          const list = Array.isArray(revs) ? revs : revs?.results || [];
          return list.map((r) => ({
            ...r,
            type: 'product',
            productId: prod.id,
            productName: prod.name,
            productImage: productService.getProductImage(prod),
            sellerId: prod.seller ? (prod.seller.id || prod.seller) : null,
            sellerName: prod.seller ? (prod.seller.store_name || 'Vendor Store') : 'In-House / NexaMart',
            sellerSlug: prod.seller?.slug || null,
            targetName: prod.name,
          }));
        } catch {
          return [];
        }
      });

      const [storeResults, prodResults] = await Promise.all([
        Promise.all(storeReviewPromises),
        Promise.all(productReviewPromises),
      ]);

      const flatList = [...storeResults.flat(), ...prodResults.flat()];
      // Sort newest first
      flatList.sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0));
      setReviews(flatList);
    } catch (err) {
      console.error('Failed to load reviews for moderation:', err);
      setError('Failed to aggregate reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  // Compute metrics
  const { totalReviews, avgRating, criticalCount } = useMemo(() => {
    if (!reviews.length) return { totalReviews: 0, avgRating: 5.0, criticalCount: 0 };
    const sum = reviews.reduce((acc, r) => acc + Number(r.ratings || r.rating || 5), 0);
    const avg = parseFloat((sum / reviews.length).toFixed(1));
    const crit = reviews.filter((r) => Number(r.ratings || r.rating || 5) <= 2).length;
    return { totalReviews: reviews.length, avgRating: avg, criticalCount: crit };
  }, [reviews]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    let list = reviews;

    if (selectedType !== 'all') {
      list = list.filter((r) => r.type === selectedType);
    }

    if (selectedVendor !== 'all') {
      list = list.filter((r) => String(r.sellerId) === String(selectedVendor));
    }

    if (selectedRating !== 'all') {
      const target = Number(selectedRating);
      list = list.filter((r) => Math.round(Number(r.ratings || r.rating || 5)) === target);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const authorName =
          r.user_name ||
          (typeof r.user === 'object' ? r.user?.name || r.user?.email : r.user);
        const commentMatch = String(r.comment || '').toLowerCase().includes(q);
        const nameMatch = String(authorName || '').toLowerCase().includes(q);
        const targetMatch = String(r.targetName || r.productName || '').toLowerCase().includes(q);
        const vendorMatch = String(r.sellerName || '').toLowerCase().includes(q);
        return commentMatch || nameMatch || targetMatch || vendorMatch;
      });
    }

    return list;
  }, [reviews, selectedType, selectedVendor, selectedRating, searchQuery]);

  // Delete review action
  const handleDeleteConfirm = async () => {
    if (!deletingReview) return;

    setDeleteLoading(true);
    try {
      if (deletingReview.type === 'store') {
        await sellerService.deleteStoreReview(deletingReview.sellerSlug, deletingReview.id);
      } else {
        await productService.deleteProductReview(deletingReview.productId, deletingReview.id);
      }
      setReviews((prev) =>
        prev.filter((r) => !(r.id === deletingReview.id && r.type === deletingReview.type))
      );
      setFeedbackMessage({
        type: 'success',
        text: 'Review deleted and removed from store.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
      setDeletingReview(null);
    } catch (err) {
      console.error('Failed to delete review:', err);
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to remove review.',
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Review Moderation
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor customer sentiment, moderate public feedback, and address critical reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAllReviews}
          className="self-start sm:self-auto p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          title="Refresh reviews"
          aria-label="Refresh reviews"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Reviews</p>
            <h3 className="text-2xl font-black text-slate-900">{totalReviews}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Average Rating</p>
            <h3 className="text-2xl font-black text-slate-900">{avgRating} / 5.0</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Critical (1-2 Stars)</p>
            <h3 className="text-2xl font-black text-rose-600">{criticalCount}</h3>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-2xs border animate-fade-in ${
            feedbackMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            )}
            <span className="text-sm font-semibold">{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reviews Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, comment, or product..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Review Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 px-3.5 py-2 outline-none font-medium cursor-pointer shadow-2xs"
            >
              <option value="all">All Review Types</option>
              <option value="store">Store Reviews only</option>
              <option value="product">Product Reviews only</option>
            </select>

            {/* Vendor Filter */}
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 px-3.5 py-2 outline-none font-medium cursor-pointer shadow-2xs"
            >
              <option value="all">All Vendors / Stores</option>
              {vendors.map((v) => (
                <option key={v.id} value={String(v.id)}>
                  {v.store_name}
                </option>
              ))}
            </select>

            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 px-3.5 py-2 outline-none font-medium cursor-pointer shadow-2xs"
            >
              <option value="all">All Star Ratings</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars only</option>
              <option value="3">3 Stars only</option>
              <option value="2">2 Stars only</option>
              <option value="1">1 Star only</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto min-h-[350px]">
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 mb-2">{error}</p>
              <button
                type="button"
                onClick={fetchAllReviews}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="font-bold text-slate-800 text-base mb-1">
                No reviews found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No customer reviews match your active filter settings.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Target / Item</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Vendor / Store</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Comment</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Moderate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((rev) => {
                  const authorName =
                    rev.user_name ||
                    (typeof rev.user === 'object' && rev.user?.name
                      ? rev.user.name
                      : typeof rev.user === 'object' && rev.user?.email
                        ? rev.user.email
                        : rev.user || 'Verified Customer');

                  const ratingNum = Number(rev.ratings || rev.rating || 5);
                  const isStoreReview = rev.type === 'store';
                  const targetUrl = isStoreReview
                    ? `/stores/${rev.sellerSlug}`
                    : `/products/${rev.productId}`;

                  return (
                    <tr key={`${rev.type}-${rev.id}`} className="hover:bg-slate-50 transition-colors group">
                      {/* Target / Item */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                            {isStoreReview ? (
                              rev.sellerLogo ? (
                                <img
                                  src={rev.sellerLogo}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Store className="w-5 h-5 text-emerald-600" />
                              )
                            ) : (
                              <img
                                src={rev.productImage}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://placehold.co/100x100?text=Item';
                                }}
                              />
                            )}
                          </div>
                          <Link
                            to={targetUrl}
                            className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[150px] block"
                          >
                            {isStoreReview ? rev.sellerName : rev.productName}
                          </Link>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        {isStoreReview ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Store Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Product Review
                          </span>
                        )}
                      </td>

                      {/* Vendor / Store */}
                      <td className="px-6 py-4">
                        {rev.sellerSlug ? (
                          <Link
                            to={`/stores/${rev.sellerSlug}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[120px]">{rev.sellerName}</span>
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                            <span className="truncate max-w-[120px]">{rev.sellerName || 'NexaMart'}</span>
                          </span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{authorName}</span>
                      </td>

                      {/* Star Rating */}
                      <td className="px-6 py-4">
                        <StarRating rating={ratingNum} size="sm" showValue={false} />
                      </td>

                      {/* Comment */}
                      <td className="px-6 py-4">
                        <p className="text-slate-600 text-xs max-w-xs sm:max-w-md truncate">
                          {rev.comment}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {formatDate(rev.created_at || rev.date, { format: 'medium' })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title={isStoreReview ? 'View storefront' : 'View product storefront'}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeletingReview(rev)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Review Modal */}
      {deletingReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-2xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
              Remove Customer Review?
            </h3>
            <p className="text-slate-600 text-sm text-center mb-6 leading-relaxed">
              Are you sure you want to delete this {deletingReview.type === 'store' ? 'store' : 'product'} review from{' '}
              <strong className="text-slate-900">
                &quot;{deletingReview.user_name || (typeof deletingReview.user === 'object' ? deletingReview.user?.name || deletingReview.user?.email : deletingReview.user)}&quot;
              </strong>
              ? It will no longer appear on the {deletingReview.type === 'store' ? 'store' : 'product'} page.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingReview(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteConfirm}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Remove Review</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReviews;
