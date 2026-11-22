import React, { useState } from 'react';
import { Trash2, Edit2, User, Loader2 } from 'lucide-react';
import StarRating from '../Common/StarRating';
import { formatDate } from '../../utils/formatters';

/**
 * ReviewCard Component
 * Displays a single customer review with avatar, rating, timestamp, and author actions.
 * Strictly adheres to nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {Object} props.review - Review object { id, user: { id, name }, ratings, comment, created_at }
 * @param {Object} [props.currentUser] - Authenticated user object
 * @param {Function} [props.onDelete] - Delete review callback (reviewId) => Promise<void>
 * @param {Function} [props.onEdit] - Edit review callback (review) => void
 */
const ReviewCard = ({ review, currentUser, onDelete, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!review) return null;

  // Extract author display name safely
  const authorName =
    typeof review.user === 'object' && review.user?.name
      ? review.user.name
      : typeof review.user === 'string'
      ? review.user
      : 'Verified Customer';

  const authorInitial = authorName.charAt(0).toUpperCase() || 'C';

  // Check if current user is author or staff/admin
  const authorId = typeof review.user === 'object' ? review.user?.id : review.user;
  const isAuthor = currentUser && authorId && Number(currentUser.id) === Number(authorId);
  const canManage = isAuthor || Boolean(currentUser?.is_staff);

  const ratingValue = Number(review.ratings || review.rating || 5);
  const reviewDate = review.created_at || review.date;

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    if (window.confirm('Are you sure you want to delete your review?')) {
      setIsDeleting(true);
      try {
        await onDelete(review.id);
      } catch (err) {
        console.error('Failed to delete review:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-4">
        {/* User Avatar & Info */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 shadow-2xs">
            {authorInitial}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-base">{authorName}</h4>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Verified Purchase
              </span>
            </div>

            <div className="flex items-center gap-2.5 mt-1.5">
              <StarRating rating={ratingValue} size="sm" showValue={false} />
              {reviewDate && (
                <span className="text-xs text-slate-400">
                  {formatDate(reviewDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls for Author/Admin */}
        {canManage && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(review)}
                disabled={isDeleting}
                aria-label="Edit review"
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit review"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label="Delete review"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete review"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Review Comment Text */}
      <p className="text-slate-600 text-sm sm:text-base mt-4 leading-relaxed pl-0 sm:pl-15">
        {review.comment}
      </p>
    </div>
  );
};

export default ReviewCard;
