import React from 'react';
import { Search } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

/**
 * ProductGrid Component
 * Renders a responsive grid of products matching nexamart_app.tsx layout.
 *
 * @param {Object} props
 * @param {Array} props.products - List of product items
 * @param {boolean} [props.loading=false] - If true, renders animated skeletons
 * @param {number} [props.skeletonCount=8] - Number of skeletons while loading
 * @param {Function} [props.onAddToCart] - Cart addition handler
 * @param {Function} [props.onClearFilters] - Callback to clear search/filters when empty
 * @param {string} [props.emptyTitle='No products found']
 * @param {string} [props.emptyDescription='Try adjusting your filters or search query.']
 * @param {string} [props.className='']
 */
const ProductGrid = ({
  products = [],
  loading = false,
  skeletonCount = 8,
  onAddToCart,
  onClearFilters,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your filters or search query.',
  className = '',
}) => {
  // 1. Loading State -> Render Skeletons in Grid
  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
      >
        <ProductSkeleton count={skeletonCount} />
      </div>
    );
  }

  // 2. Empty State -> Replicates nexamart_app.tsx empty state design
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs animate-fade-in">
        <div className="inline-flex w-16 h-16 bg-slate-100 rounded-full items-center justify-center text-slate-400 mb-4">
          <Search className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{emptyTitle}</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">{emptyDescription}</p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  // 3. Products Loaded -> Render Cards Grid
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in ${className}`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
