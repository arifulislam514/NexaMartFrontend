import React, { useState, useMemo } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, X } from 'lucide-react';
import StarRating from '../Common/StarRating';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import EditReviewModal from './EditReviewModal';

/**
 * ReviewSection Component
 * Aggregates product rating summary, review submission form, and review list.
 *
 * @param {Object} props
 * @param {Array} [props.reviews=[]] - List of reviews
 * @param {number} [props.averageRating=5.0] - Calculated average rating
 * @param {number} [props.totalReviews=0] - Total count of reviews
 * @param {Object} [props.currentUser] - Authenticated user
 * @param {boolean} [props.isAuthenticated=false] - Auth flag
 * @param {Function} props.onSubmitReview - (reviewData) => Promise<void>
 * @param {Function} [props.onDeleteReview] - (reviewId) => Promise<void>
 * @param {Function} [props.onUpdateReview] - (reviewId, reviewData) => Promise<void>
 * @param {boolean} [props.loading=false]
 */
const ReviewSection = ({
  reviews = [],
  averageRating = 5.0,
  totalReviews = 0,
  currentUser,
  isAuthenticated = false,
  onSubmitReview,
  onDeleteReview,
  onUpdateReview,
  loading = false,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Compute breakdown of 1-5 star ratings for progress bars
  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!reviews || reviews.length === 0) return counts;

    reviews.forEach((r) => {
      const score = Math.min(5, Math.max(1, Math.round(Number(r.ratings || r.rating || 5))));
      counts[score] = (counts[score] || 0) + 1;
    });

    return counts;
  }, [reviews]);

  const effectiveTotal = Math.max(totalReviews, reviews?.length || 0);

  const handleReviewSubmit = async (data) => {
    if (onSubmitReview) {
      await onSubmitReview(data);
      setShowReviewForm(false);
      setFeedbackMessage({
        type: 'success',
        text: 'Thank you! Your review has been submitted successfully.',
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const handleEditSubmit = async (reviewId, updatedData) => {
    if (onUpdateReview) {
      await onUpdateReview(reviewId, updatedData);
      setFeedbackMessage({
        type: 'success',
        text: 'Your review has been updated successfully.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
    setEditingReview(null);
  };

  const handleDeleteReview = async (reviewId) => {
    if (onDeleteReview) {
      await onDeleteReview(reviewId);
      setFeedbackMessage({
        type: 'success',
        text: 'Review deleted successfully.',
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast / Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-2xs border animate-fade-in ${
            feedbackMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
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

      {/* Top Rating Summary Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Average Score */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-8">
            <span className="text-5xl font-black text-slate-900 tracking-tight mb-2">
              {Number(averageRating || 5).toFixed(1)}
            </span>
            <StarRating rating={Number(averageRating || 5)} size="md" showValue={false} className="mb-2" />
            <p className="text-sm text-slate-500 font-medium">
              Based on {effectiveTotal} {effectiveTotal === 1 ? 'verified review' : 'verified reviews'}
            </p>

            <button
              type="button"
              onClick={() => setShowReviewForm((prev) => !prev)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{showReviewForm ? 'Cancel Review' : 'Write a Review'}</span>
            </button>
          </div>

          {/* Star Distribution Breakdown */}
          <div className="md:col-span-8 space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars] || 0;
              const percentage = effectiveTotal > 0 ? (count / effectiveTotal) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-xs sm:text-sm">
                  <span className="w-12 font-semibold text-slate-700 flex items-center gap-1">
                    {stars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-medium text-xs">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Form (Conditional display or toggle) */}
      {showReviewForm && (
        <div className="animate-fade-in">
          <ReviewForm
            onSubmit={handleReviewSubmit}
            isAuthenticated={isAuthenticated}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Customer Reviews List */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Customer Reviews ({effectiveTotal})
        </h3>

        <ReviewList
          reviews={reviews}
          currentUser={currentUser}
          onDeleteReview={handleDeleteReview}
          onEditReview={(review) => setEditingReview(review)}
          loading={loading}
        />
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSave={handleEditSubmit}
        />
      )}
    </div>
  );
};

export default ReviewSection;
