import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import useProducts from '../../hooks/useProducts';
import ProductGrid from '../Products/ProductGrid';
import ErrorAlert from '../Common/ErrorAlert';

/**
 * LatestProducts Component
 * Featured / Trending products showcase for the home page.
 * Strictly adheres to nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {string} [props.title='Trending Now']
 * @param {string} [props.subtitle='Our most popular products this week.']
 * @param {number} [props.limit=8]
 * @param {string} [props.ordering='-updated_at']
 * @param {Function} [props.onAddToCart]
 * @param {string} [props.className='']
 */
const LatestProducts = ({
  title = 'Trending Now',
  subtitle = 'Our most popular products this week.',
  limit = 8,
  ordering = '-updated_at',
  onAddToCart,
  className = '',
}) => {
  const { products, loading, error, refetch } = useProducts({
    ordering,
    page: 1,
  });

  const displayProducts = products ? products.slice(0, limit) : [];

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              {title}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">{subtitle}</p>
          </div>

          <Link
            to="/products"
            className="hidden sm:inline-flex text-indigo-600 font-semibold text-sm hover:text-indigo-800 items-center gap-1 transition-colors group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} onRetry={refetch} />
          </div>
        )}

        {/* Product Grid / Skeletons */}
        <ProductGrid
          products={displayProducts}
          loading={loading}
          skeletonCount={limit}
          onAddToCart={onAddToCart}
        />

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-1.5 w-full px-6 py-3 bg-indigo-50 text-indigo-700 font-semibold text-sm rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <span>View All Products</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestProducts;
