import React from 'react';
import { MessageSquareOff } from 'lucide-react';
import ReviewCard from './ReviewCard';

/**
 * ReviewList Component
 * Displays a list of customer reviews, or an empty state if no reviews are available.
 *
 * @param {Object} props
 * @param {Array} [props.reviews=[]] - Array of review objects
 * @param {Object} [props.currentUser] - Currently authenticated user
 * @param {Function} [props.onDeleteReview] - Callback to delete a review (reviewId) => void
 * @param {Function} [props.onEditReview] - Callback to edit a review (review) => void
 * @param {boolean} [props.loading=false]
 */
const ReviewList = ({
  reviews = [],
  currentUser,
  onDeleteReview,
  onEditReview,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-6 bg-slate-50 border border-slate-200 rounded-2xl animate-pulse flex gap-4"
          >
            <div className="w-11 h-11 bg-slate-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="w-32 h-4 bg-slate-200 rounded" />
              <div className="w-24 h-3 bg-slate-200 rounded" />
              <div className="w-full h-12 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageSquareOff className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-1">No reviews yet</h4>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Be the first customer to share your thoughts and review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          currentUser={currentUser}
          onDelete={onDeleteReview}
          onEdit={onEditReview}
        />
      ))}
    </div>
  );
};

export default ReviewList;
