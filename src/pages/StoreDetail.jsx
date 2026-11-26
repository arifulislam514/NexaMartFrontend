import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  Star,
  Package,
  Phone,
  ShieldCheck,
  Calendar,
  MessageSquare,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Send,
} from 'lucide-react';
import sellerService from '../services/sellerService';
import ProductCard from '../components/Products/ProductCard';
import StarRating from '../components/Common/StarRating';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { formatDate } from '../utils/formatters';

/**
 * StoreDetail Page
 * Public storefront view for visitors and buyers.
 * Route: /stores/:slug
 * Displays:
 * - Store header: Banner, logo, verified badge, description, rating, review count
 * - Tab 1 (Products): Product catalog grid sold by this specific seller
 * - Tab 2 (Reviews): Customer store reviews list and review submission form
 */
const StoreDetail = () => {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'reviews'
  const [error, setError] = useState(null);

  // Review Submission State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  // Fetch Store, Products, and Reviews
  const fetchStoreData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const [storeData, productsData, reviewsData] = await Promise.all([
        sellerService.getStore(slug),
        sellerService.getStoreProducts(slug),
        sellerService.getStoreReviews(slug),
      ]);
      setStore(storeData);
      const prodList = Array.isArray(productsData) ? productsData : productsData?.results || [];
      setProducts(prodList);
      const revList = Array.isArray(reviewsData) ? reviewsData : reviewsData?.results || [];
      setReviews(revList);
    } catch (err) {
      console.error('Failed to load store data:', err);
      setError('Store not found or temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  // Handle Review Submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError('Please write a comment for your review.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError(null);
      setReviewSuccess(null);

      await sellerService.createStoreReview(slug, {
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      });

      setReviewComment('');
      setReviewSuccess('Your review has been submitted successfully!');
      // Re-fetch reviews to show updated list
      const updatedRevs = await sellerService.getStoreReviews(slug);
      const list = Array.isArray(updatedRevs) ? updatedRevs : updatedRevs?.results || [];
      setReviews(list);
      setTimeout(() => setReviewSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to post store review:', err);
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Could not submit review. Please try again.';
      setReviewError(detail);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading store profile...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Store Not Found</h2>
        <p className="text-slate-500 mb-6 text-sm">{error || 'This store does not exist or has been removed.'}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  const avgRating = Number(store.average_rating || 5.0);
  const totalReviews = Number(store.total_reviews || reviews.length || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs text-slate-500 gap-1.5">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-indigo-600 transition-colors">Stores</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-slate-900">{store.store_name}</span>
      </nav>

      {/* Store Header Banner Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        {/* Top Cover Banner */}
        <div className="h-44 sm:h-56 bg-gradient-to-r from-emerald-800 via-slate-800 to-indigo-900 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute right-6 top-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-emerald-800 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Merchant
            </span>
          </div>
        </div>

        {/* Store Avatar & Info Strip */}
        <div className="p-6 sm:p-8 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Logo */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-1.5 shadow-xl border-4 border-white flex-shrink-0">
              <div className="w-full h-full rounded-2xl bg-emerald-50 text-emerald-800 font-black text-3xl flex items-center justify-center overflow-hidden border border-emerald-100">
                {store.logo ? (
                  <img src={store.logo} alt={store.store_name} className="w-full h-full object-cover" />
                ) : (
                  store.store_name.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {store.store_name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
                {store.description || 'Welcome to our verified marketplace store.'}
              </p>

              {/* Badges / Rating row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{avgRating.toFixed(1)}</span>
                  <span className="text-slate-400 font-medium">({totalReviews} reviews)</span>
                </div>

                <div className="flex items-center gap-1.5 font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Package className="w-3.5 h-3.5 text-slate-500" />
                  <span>{store.total_products || products.length} Products</span>
                </div>

                {store.phone && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{store.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'products'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Store Reviews ({reviews.length})</span>
        </button>
      </div>

      {/* Tab 1: Store Products */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {products.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No products listed</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                This store has not published any active items yet. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={async (p) => {
                    await addToCart(p, 1);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Store Reviews & Submission Form */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Customer Feedback ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No reviews written for this store yet. Be the first to leave feedback!
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700">
                          {(rev.user_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {rev.user_name || 'Customer'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(rev.created_at, { format: 'short' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <StarRating rating={rev.rating} size="sm" showValue={false} />
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Col: Write a Review Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs h-fit space-y-4">
            <h4 className="font-extrabold text-slate-900 text-base">Write Store Review</h4>
            <p className="text-xs text-slate-500">
              Share your shopping experience with {store.store_name}.
            </p>

            {reviewSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            {reviewError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {reviewRating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Comment textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Feedback
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell other shoppers about product authenticity, packaging, and shipping speed..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Review</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-3">
                <p className="text-xs text-slate-600">Please sign in to leave a store review.</p>
                <Link
                  to="/login"
                  className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetail;
