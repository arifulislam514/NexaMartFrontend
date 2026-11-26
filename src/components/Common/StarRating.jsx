import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating Component
 * Supports both display mode (with fractional/rounded stars) and interactive review mode.
 * Matches nexamart_app.tsx amber-400 styling.
 *
 * @param {Object} props
 * @param {number} [props.rating=0] - Current rating value (e.g. 4.8)
 * @param {number} [props.maxStars=5] - Maximum stars
 * @param {number} [props.reviewsCount] - Optional total reviews count to display
 * @param {boolean} [props.showValue=true] - Display numeric value (e.g. 4.8)
 * @param {'sm'|'md'|'lg'} [props.size='sm'] - Star icon size
 * @param {boolean} [props.interactive=false] - If true, enables user rating click & hover
 * @param {Function} [props.onChange] - Callback when rating changes in interactive mode (rating: number)
 * @param {string} [props.className=''] - Extra classes
 */
const StarRating = ({
  rating = 0,
  maxStars = 5,
  reviewsCount,
  showValue = true,
  size = 'sm',
  interactive = false,
  onChange,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const starSize = sizeClasses[size] || sizeClasses.sm;
  const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-amber-400">
        {Array.from({ length: maxStars }, (_, idx) => {
          const starValue = idx + 1;
          const isFilled = starValue <= Math.round(currentRating);

          if (interactive) {
            return (
              <button
                key={starValue}
                type="button"
                onClick={() => onChange && onChange(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${starValue} of ${maxStars} stars`}
                className="p-0.5 text-amber-400 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={starSize}
                  fill={isFilled ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={2}
                />
              </button>
            );
          }

          return (
            <Star
              key={starValue}
              className={`${starSize} ${isFilled ? 'text-amber-400' : 'text-slate-300'}`}
              fill={isFilled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
            />
          );
        })}
      </div>

      {/* Numeric rating label */}
      {!interactive && showValue && (
        <span className="text-sm font-semibold text-slate-700">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {/* Reviews count label */}
      {!interactive && reviewsCount !== undefined && (
        <span className="text-xs text-slate-500 font-semibold">
          ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
