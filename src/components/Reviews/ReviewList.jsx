import React, { useState, useMemo } from 'react';
import { MessageSquareOff, SlidersHorizontal } from 'lucide-react';
import ReviewCard from './ReviewCard';

/**
 * ReviewList Component
 * Displays a sorted collection of customer reviews, loading skeletons,
 * or an empty state when no reviews have been submitted.
 *
 * @param {Object} props
 * @param {Array} [props.reviews=[]] - Array of review objects
 * @param {Object} [props.currentUser] - Currently authenticated user
 * @param {Function} [props.onDeleteReview] - (reviewId) => Promise<void>
 * @param {Function} [props.onEditReview] - (review) => void
 * @param {boolean} [props.loading=false]
 * @param {string} [props.className='']
 */
const ReviewList = ({
  reviews = [],
  currentUser,
  onDeleteReview,
  onEditReview,
  loading = false,
  className = '',
}) => {
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'highest' | 'lowest'

  // Sort reviews based on user selection
  const sortedReviews = useMemo(() => {
    if (!Array.isArray(reviews) || reviews.length <= 1) return reviews;

    const copy = [...reviews];
    if (sortBy === 'highest') {
      return copy.sort((a, b) => Number(b.ratings || b.rating || 0) - Number(a.ratings || a.rating || 0));
    }
    if (sortBy === 'lowest') {
      return copy.sort((a, b) => Number(a.ratings || a.rating || 0) - Number(b.ratings || b.rating || 0));
    }
    // Default 'recent': sort by date or id descending
    return copy.sort((a, b) => {
      const dateA = new Date(a.created_at || a.date || 0).getTime();
      const dateB = new Date(b.created_at || b.date || 0).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [reviews, sortBy]);

  // Loading Skeletons
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 bg-slate-50 border border-slate-200 rounded-2xl animate-pulse flex gap-5"
          >
            <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <div className="w-32 h-4 bg-slate-200 rounded" />
                <div className="w-20 h-3 bg-slate-200 rounded" />
              </div>
              <div className="w-24 h-3 bg-slate-200 rounded" />
              <div className="w-full h-12 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (!reviews || reviews.length === 0) {
    return (
      <div
        className={`text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 ${className}`}
      >
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageSquareOff className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-1">
          No customer reviews yet
        </h4>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Be the first customer to share your thoughts and review this product!
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Sorting Bar (only if multiple reviews) */}
      {reviews.length > 1 && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs text-slate-400 font-medium">
            Showing {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Review Cards List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUser={currentUser}
            onDelete={onDeleteReview}
            onEdit={onEditReview}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
