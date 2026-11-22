import React from 'react';
import CategoryCard from './CategoryCard';
import useCategories from '../../../hooks/useCategories';

/**
 * CategoryList Component
 * Section showcasing shop categories in a 4-column responsive grid matching nexamart_app.tsx.
 *
 * @param {Object} props
 * @param {Array} [props.categories] - Optional custom categories array; if omitted, fetches via useCategories
 * @param {boolean} [props.loading] - Optional loading flag
 * @param {string} [props.title='Shop by Category'] - Section title
 * @param {number} [props.limit] - Optional max items to display
 * @param {string} [props.className='']
 */
const CategoryList = ({
  categories: propCategories,
  loading: propLoading,
  title = 'Shop by Category',
  limit,
  className = '',
}) => {
  // Use custom hook if categories aren't provided via props
  const hookResult = useCategories({ autoFetch: !propCategories });
  const categories = propCategories || hookResult.categories || [];
  const loading = propLoading !== undefined ? propLoading : hookResult.loading;

  const displayCategories = limit ? categories.slice(0, limit) : categories;

  return (
    <section className={`py-16 bg-slate-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center justify-between"
              >
                <div className="space-y-2">
                  <div className="w-28 h-5 bg-slate-200 rounded"></div>
                  <div className="w-16 h-4 bg-slate-100 rounded"></div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100"></div>
              </div>
            ))}
          </div>
        ) : displayCategories.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-500">
            No categories available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryList;
