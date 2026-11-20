/**
 * Utility functions for formatting currency (৳), dates, numbers, and text.
 * Tailored for NexaMart based on API_DOCUMENTATION.md and nexamart_app.tsx design.
 */

export const CURRENCY_SYMBOL = '৳';

/**
 * Format a number/string into Bangladeshi Taka currency format (e.g. ৳2,500.00).
 * Handles null, undefined, strings from DRF APIs, and numbers safely.
 *
 * @param {number|string} amount - The amount to format
 * @param {Object} [options]
 * @param {boolean} [options.withSymbol=true] - Whether to prepend '৳'
 * @param {number} [options.decimals=2] - Number of decimal places
 * @param {boolean} [options.spaceAfterSymbol=false] - If true, returns '৳ 2,500.00'
 * @returns {string} Formatted currency string
 */
export const formatPrice = (amount, options = {}) => {
  const {
    withSymbol = true,
    decimals = 2,
    spaceAfterSymbol = false,
  } = options;

  const num = Number(amount);
  if (isNaN(num)) {
    return withSymbol ? `${CURRENCY_SYMBOL}${spaceAfterSymbol ? ' ' : ''}0.00` : '0.00';
  }

  const formattedNum = num.toLocaleString('en-BD', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (!withSymbol) return formattedNum;

  const symbol = `${CURRENCY_SYMBOL}${spaceAfterSymbol ? ' ' : ''}`;
  return `${symbol}${formattedNum}`;
};

/**
 * Shorthand alias for formatPrice (e.g. ৳2,500.00).
 *
 * @param {number|string} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => formatPrice(amount);

/**
 * Format an ISO date string or Date object into a readable date string.
 *
 * @param {string|Date} dateValue - ISO date string (e.g. '2026-11-20T10:00:00Z') or Date object
 * @param {Object} [options]
 * @param {'medium'|'short'|'long'|'iso'} [options.format='medium'] - Format style
 * @returns {string} Formatted date string (e.g. '20 Nov 2026' or '2026-11-20')
 */
export const formatDate = (dateValue, options = {}) => {
  if (!dateValue) return 'N/A';

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);

    const { format = 'medium' } = options;

    if (format === 'iso') {
      return date.toISOString().split('T')[0];
    }

    if (format === 'short') {
      // e.g. 20/11/2026
      return date.toLocaleDateString('en-GB');
    }

    if (format === 'long') {
      // e.g. November 20, 2026
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    // Default 'medium': e.g. 20 Nov 2026
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateValue);
  }
};

/**
 * Format a date with time (e.g. '20 Nov 2026, 04:30 PM').
 *
 * @param {string|Date} dateValue
 * @returns {string}
 */
export const formatDateTime = (dateValue) => {
  if (!dateValue) return 'N/A';

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);

    const datePart = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const timePart = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${datePart}, ${timePart}`;
  } catch {
    return String(dateValue);
  }
};

/**
 * Format a date into relative time (e.g. 'Just now', '5 mins ago', '2 hours ago', '3 days ago').
 *
 * @param {string|Date} dateValue
 * @returns {string}
 */
export const formatRelativeTime = (dateValue) => {
  if (!dateValue) return '';

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    return formatDate(date, { format: 'medium' });
  } catch {
    return String(dateValue);
  }
};

/**
 * Format large numbers with commas (e.g. 1000 -> 1,000).
 *
 * @param {number|string} value
 * @returns {string}
 */
export const formatNumber = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-BD');
};

/**
 * Truncate long text with ellipsis.
 *
 * @param {string} text
 * @param {number} [maxLength=100]
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};
