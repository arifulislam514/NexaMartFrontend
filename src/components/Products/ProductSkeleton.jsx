import React from 'react';

/**
 * ProductSkeleton Component
 * Animated skeleton placeholder matching ProductCard dimensions and structure.
 *
 * @param {Object} props
 * @param {number} [props.count=1] - Number of skeleton cards to render
 */
const ProductSkeleton = ({ count = 1 }) => {
  const skeletons = Array.from({ length: Math.max(1, count) });

  const renderSingleSkeleton = (key) => (
    <div
      key={key}
      className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col animate-pulse"
    >
      {/* Aspect-square Image Skeleton */}
      <div className="relative aspect-square bg-slate-100 flex items-center justify-center">
        {/* Placeholder category badge */}
        <div className="absolute top-3 left-3 w-20 h-5 bg-slate-200 rounded-full"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-1">
        {/* Rating Line Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-20 h-4 bg-slate-200 rounded"></div>
          <div className="w-8 h-3 bg-slate-100 rounded"></div>
        </div>

        {/* Title Skeleton (2 lines) */}
        <div className="w-3/4 h-5 bg-slate-200 rounded mb-2"></div>
        <div className="w-1/2 h-5 bg-slate-200 rounded mb-3"></div>

        {/* Description Skeleton */}
        <div className="space-y-1.5 mb-5 flex-1">
          <div className="w-full h-3 bg-slate-100 rounded"></div>
          <div className="w-4/5 h-3 bg-slate-100 rounded"></div>
        </div>

        {/* Footer Skeleton: Price and Button */}
        <div className="flex items-end justify-between pt-4 border-t border-slate-100 mt-auto">
          <div>
            <div className="w-24 h-6 bg-slate-200 rounded mb-1"></div>
            <div className="w-16 h-3 bg-slate-100 rounded"></div>
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  if (count === 1) {
    return renderSingleSkeleton(0);
  }

  return (
    <>
      {skeletons.map((_, idx) => renderSingleSkeleton(idx))}
    </>
  );
};

export default ProductSkeleton;
