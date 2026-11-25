import React, { useState, useEffect } from 'react';
import { X, Loader2, Star, Check } from 'lucide-react';
import StarRating from '../Common/StarRating';

/**
 * EditReviewModal Component
 * Modal dialog enabling review authors to modify their star rating and comment.
 * Strictly adheres to nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {Object} props.review - Existing review object { id, ratings, comment }
 * @param {Function} props.onClose - Modal dismissal handler
 * @param {Function} props.onSave - (reviewId, { ratings, comment }) => Promise<void>
 */
const EditReviewModal = ({ review, onClose, onSave }) => {
  const [rating, setRating] = useState(
    Number(review?.ratings || review?.rating || 5)
  );
  const [comment, setComment] = useState(review?.comment || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !saving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving]);

  if (!review) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a comment for your review.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Please choose a rating between 1 and 5 stars.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(review.id, {
        ratings: rating,
        comment: comment.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to update review:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.comment?.[0] ||
        err.response?.data?.ratings?.[0] ||
        'Failed to update review. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-edit-review-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3
              id="modal-edit-review-title"
              className="text-xl font-bold text-slate-900"
            >
              Edit Your Review
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Update your feedback and rating for this product
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Overall Rating
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

          <div>
            <label
              htmlFor="edit-comment"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
            >
              Your Comment
            </label>
            <textarea
              id="edit-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={saving}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-y"
              maxLength={1000}
            />
            <div className="text-right mt-1 text-xs text-slate-400">
              {comment.length} / 1000 characters
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !comment.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReviewModal;
