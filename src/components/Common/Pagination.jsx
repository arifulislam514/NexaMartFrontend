import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { APP_CONFIG } from '../../utils/constants';

/**
 * Pagination Component
 * Matches the pagination design from nexamart_app.tsx.
 *
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-based)
 * @param {number} props.totalCount - Total number of records from API
 * @param {number} [props.pageSize=10] - Items per page
 * @param {Function} props.onPageChange - Handler called when a new page is clicked (pageNumber)
 * @param {boolean} [props.showSummary=true] - Whether to show "Showing X to Y of Z results"
 * @param {string} [props.className=''] - Extra classes
 */
const Pagination = ({
  currentPage = 1,
  totalCount = 0,
  pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE,
  onPageChange,
  showSummary = true,
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // If there are no items or only 1 page with no items, hide pagination
  if (totalCount === 0) return null;

  const startIndex = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers with smart ellipsis window
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 shadow-sm ${className}`}
    >
      {showSummary && (
        <span className="font-medium text-slate-600">
          Showing <span className="font-semibold text-slate-900">{startIndex}</span> to{' '}
          <span className="font-semibold text-slate-900">{endIndex}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalCount}</span> results
        </span>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-1 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pages.map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 select-none">
                    &hellip;
                  </span>
                );
              }

              const isCurrent = page === currentPage;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-indigo-600'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-1 shadow-xs"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
