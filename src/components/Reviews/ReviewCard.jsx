import React, { useState } from 'react';
import { Trash2, Edit2, Loader2, CheckCircle2 } from 'lucide-react';
import StarRating from '../Common/StarRating';
import { formatDate } from '../../utils/formatters';

/**
 * ReviewCard Component
 * Displays a single customer review with avatar initial, star rating,
 * formatted timestamp, and author/admin management actions.
 * Strictly adheres to nexamart_app.tsx styling.
 *
 * @param {Object} props
 * @param {Object} props.review - Review object { id, user: { id, name }, ratings, comment, created_at }
 * @param {Object} [props.currentUser] - Authenticated user object
 * @param {Function} [props.onDelete] - (reviewId) => Promise<void>
 * @param {Function} [props.onEdit] - (review) => void
 * @param {string} [props.className='']
 */
const ReviewCard = ({
  review,
  currentUser,
  onDelete,
  onEdit,
  className = '',
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!review) return null;

  // Extract author display name safely
  const authorName =
    typeof review.user === 'object' && review.user?.name
      ? review.user.name
      : typeof review.user === 'string'
      ? review.user
      : 'Verified Shopper';

  const authorInitial = authorName.charAt(0).toUpperCase() || 'U';

  // Check if current user is the author or admin
  const authorId = typeof review.user === 'object' ? review.user?.id : review.user;
  const isAuthor =
    currentUser && authorId && Number(currentUser.id) === Number(authorId);
  const canManage = isAuthor || Boolean(currentUser?.is_staff);

  const ratingValue = Number(review.ratings || review.rating || 5);
  const reviewDate = review.created_at || review.date;

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    if (window.confirm('Are you sure you want to delete this review?')) {
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
    <div
      className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-5 sm:gap-6 hover:border-slate-300 transition-all ${className}`}
    >
      {/* User Avatar Initial */}
      <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-2xs">
        {authorInitial}
      </div>

      {/* Review Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2 gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-base">{authorName}</h4>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified Purchase</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5 mt-1">
              <StarRating rating={ratingValue} size="sm" showValue={false} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {reviewDate && (
              <span className="text-xs sm:text-sm text-slate-400 whitespace-nowrap">
                {formatDate(reviewDate, { format: 'medium' })}
              </span>
            )}

            {/* Author or Admin Controls */}
            {canManage && (
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(review)}
                    disabled={isDeleting}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit review"
                    aria-label="Edit review"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete review"
                    aria-label="Delete review"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comment Body */}
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-2">
          {review.comment}
        </p>
      </div>
    </div>
  );
};

export default ReviewCard;
