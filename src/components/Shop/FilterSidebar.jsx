import React, { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../../utils/formatters';

/**
 * FilterSidebar Component
 * Sidebar for categories and price filtering strictly adhering to nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {Array} [props.categories=[]] - Category items from useCategories ({ id, name, product_count })
 * @param {string|number} [props.selectedCategory=''] - Current category ID
 * @param {Function} props.onSelectCategory - Category selection handler (id: string|number)
 * @param {string|number} [props.minPrice=''] - Current min price filter
 * @param {string|number} [props.maxPrice=''] - Current max price filter
 * @param {Function} props.onPriceChange - Price range handler (min, max)
 * @param {Function} [props.onReset] - Handler to clear all filters
 * @param {boolean} [props.loadingCategories=false]
 * @param {string} [props.className='']
 */
const FilterSidebar = ({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  minPrice = '',
  maxPrice = '',
  onPriceChange,
  onReset,
  loadingCategories = false,
  className = '',
}) => {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    if (onPriceChange) {
      onPriceChange(localMin, localMax);
    }
  };

  const handleResetFilters = () => {
    setLocalMin('');
    setLocalMax('');
    if (onReset) {
      onReset();
    }
  };

  const hasActiveFilters = Boolean(
    selectedCategory || minPrice || maxPrice || localMin || localMax
  );

  return (
    <aside className={`w-full lg:w-64 flex-shrink-0 space-y-6 ${className}`}>
      {/* Header with Reset Action */}
      <div className="flex items-center justify-between pb-2">
        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          <span>Filters</span>
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center justify-between">
          <span>Categories</span>
          {selectedCategory && (
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </h3>

        {loadingCategories ? (
          <div className="space-y-2.5 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 bg-slate-100 rounded-md w-full"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {/* All Categories Option */}
            <label className="flex items-center justify-between gap-3 cursor-pointer group py-1">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shop-category"
                  checked={!selectedCategory}
                  onChange={() => onSelectCategory && onSelectCategory('')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span
                  className={`text-sm transition-colors ${
                    !selectedCategory
                      ? 'font-bold text-indigo-600'
                      : 'font-medium text-slate-700 group-hover:text-indigo-600'
                  }`}
                >
                  All Categories
                </span>
              </div>
            </label>

            {/* Individual Categories from API */}
            {categories.map((cat) => {
              const isSelected = String(selectedCategory) === String(cat.id);
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between gap-3 cursor-pointer group py-1"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="radio"
                      name="shop-category"
                      checked={isSelected}
                      onChange={() => onSelectCategory && onSelectCategory(cat.id)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span
                      className={`text-sm truncate transition-colors ${
                        isSelected
                          ? 'font-bold text-indigo-600'
                          : 'font-medium text-slate-700 group-hover:text-indigo-600'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </div>
                  {cat.product_count !== undefined && (
                    <span className="text-xs text-slate-400 font-medium ml-2">
                      ({cat.product_count})
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-4">Price Range</h3>
        <form onSubmit={handlePriceSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                {CURRENCY_SYMBOL}
              </span>
              <input
                type="number"
                placeholder="Min"
                min="0"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                className="w-full pl-6 pr-2 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <span className="text-slate-400 font-medium">-</span>

            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                {CURRENCY_SYMBOL}
              </span>
              <input
                type="number"
                placeholder="Max"
                min="0"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                className="w-full pl-6 pr-2 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            Apply Price Filter
          </button>
        </form>
      </div>
    </aside>
  );
};

export default FilterSidebar;
