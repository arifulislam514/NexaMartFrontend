import React from 'react';
import { ORDER_STATUS_CONFIG, ORDER_STATUS } from '../../utils/constants';

/**
 * OrderStatusBadge Component
 * Displays order fulfillment status with accurate color tokens matching nexamart_app.tsx design.
 *
 * Supported Statuses:
 * - 'Not Paid' (Amber token)
 * - 'Ready To Ship' (Blue token)
 * - 'Shipped' (Cyan token)
 * - 'Delivered' (Emerald token)
 * - 'Canceled' (Red token)
 *
 * @param {Object} props
 * @param {string} props.status - Order status string from Django API
 * @param {boolean} [props.showDot=false] - Display colored status indicator dot
 * @param {'sm'|'md'|'lg'} [props.size='sm'] - Badge size
 * @param {string} [props.className='']
 */
const OrderStatusBadge = ({
  status,
  showDot = false,
  size = 'sm',
  className = '',
}) => {
  // Normalize status lookup (case-insensitive fallback)
  const resolvedKey =
    Object.keys(ORDER_STATUS_CONFIG).find(
      (k) => k.toLowerCase() === String(status || '').trim().toLowerCase()
    ) || ORDER_STATUS.NOT_PAID;

  const config = ORDER_STATUS_CONFIG[resolvedKey] || {
    label: status || 'Pending',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotClass: 'bg-slate-500',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs sm:text-sm',
    lg: 'px-3.5 py-1.5 text-sm font-bold',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const badgeSizeClass = sizeClasses[size] || sizeClasses.sm;
  const dotSizeClass = dotSizes[size] || dotSizes.sm;

  return (
    <span
      role="status"
      aria-label={`Order status: ${config.label}`}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border transition-colors select-none ${badgeSizeClass} ${config.badgeClass} ${className}`}
    >
      {showDot && (
        <span
          className={`rounded-full flex-shrink-0 ${dotSizeClass} ${config.dotClass}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};

export default OrderStatusBadge;
