import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * CategoryCard Component
 * Interactive category tile strictly following nexamart_app.tsx styling.
 *
 * @param {Object} props
 * @param {Object} props.category - Category object from API ({ id, name, description, product_count })
 * @param {string} [props.className='']
 */
const CategoryCard = ({ category, className = '' }) => {
  if (!category) return null;

  const productCount =
    category.product_count !== undefined
      ? category.product_count
      : category.count || 0;

  // Navigate to shop with category filter
  const targetUrl = `/products?category=${encodeURIComponent(category.name || category.id)}`;

  return (
    <Link
      to={targetUrl}
      className={`bg-white rounded-2xl p-6 shadow-xs border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between ${className}`}
    >
      <div>
        <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {productCount} {productCount === 1 ? 'Product' : 'Products'}
        </p>
      </div>

      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
};

export default CategoryCard;
