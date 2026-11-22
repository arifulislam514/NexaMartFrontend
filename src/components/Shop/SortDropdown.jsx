import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { PRODUCT_SORT_OPTIONS } from '../../utils/constants';

/**
 * SortDropdown Component
 * Toolbar sorting dropdown matching nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {string} props.value - Active ordering parameter (e.g. '-updated_at', 'price', '-price')
 * @param {Function} props.onChange - Handler called on ordering change (orderValue: string)
 * @param {number} [props.totalResults] - Optional count of results to display on the left
 * @param {Array<{ label: string, value: string }>} [props.options] - Custom sort options
 * @param {string} [props.className='']
 */
const SortDropdown = ({
  value,
  onChange,
  totalResults,
  options = PRODUCT_SORT_OPTIONS,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs mb-6 ${className}`}
    >
      <div className="text-sm text-slate-600 font-medium">
        {totalResults !== undefined ? (
          <span>
            Showing <strong className="text-slate-900">{totalResults}</strong> products
          </span>
        ) : (
          <span className="hidden sm:inline">Sort Products</span>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <label
          htmlFor="sort-select"
          className="text-sm font-medium text-slate-500 whitespace-nowrap flex items-center gap-1.5"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sort by:</span>
        </label>
        <select
          id="sort-select"
          value={value || '-updated_at'}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 outline-none cursor-pointer transition-all"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SortDropdown;
