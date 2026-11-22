import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Send, Loader2, AlertCircle, LogIn, CheckCircle } from 'lucide-react';
import StarRating from '../Common/StarRating';

/**
 * ReviewForm Component
 * Allows authenticated customers to rate and review a product (1 to 5 stars).
 * Prompts unauthenticated guests to sign in.
 *
 * @param {Object} props
 * @param {Function} props.onSubmit - Submission callback: async ({ ratings, comment }) => void
 * @param {boolean} [props.isAuthenticated=false] - Auth status flag
 * @param {Function} [props.onCancel] - Optional cancel handler
 * @param {string} [props.className='']
 */
const ReviewForm = ({
  onSubmit,
  isAuthenticated = false,
  onCancel,
  className = '',
}) => {
  const location = useLocation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // If user is not logged in, show call to action
  if (!isAuthenticated) {
    return (
      <div className={`bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6 text-center ${className}`}>
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <LogIn className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Have you purchased this product?
        </h3>
        <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
          Please sign in to your account to share your feedback and help other shoppers.
        </p>
        <Link
          to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
        >
          <span>Sign In to Review</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a comment describing your experience.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ratings: rating, comment: comment.trim() });
      setComment('');
      setRating(5);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.comment?.[0] ||
        err.response?.data?.ratings?.[0] ||
        'Could not submit review. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs ${className}`}
    >
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        Write a Customer Review
      </h3>

      {/* Success banner */}
      {success && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>Thank you! Your review has been submitted successfully.</span>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Star rating selector */}
      <div className="mb-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Your Overall Rating
        </label>
        <div className="flex items-center gap-3">
          <StarRating
            rating={rating}
            size="md"
            interactive={true}
            onChange={(newRating) => setRating(newRating)}
          />
          <span className="text-sm font-semibold text-slate-700">
            {rating} of 5 stars
          </span>
        </div>
      </div>

      {/* Comment text area */}
      <div className="mb-5">
        <label
          htmlFor="review-comment"
          className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
        >
          Review Details
        </label>
        <textarea
          id="review-comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike about this product? How was the build quality?"
          disabled={submitting}
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-y"
          maxLength={1000}
        />
        <div className="text-right mt-1 text-xs text-slate-400">
          {comment.length} / 1000 characters
        </div>
      </div>

      {/* Submit / Cancel Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Review</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
