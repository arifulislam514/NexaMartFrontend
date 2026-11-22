import React from 'react';
import { Eye, Trash2, ClipboardList } from 'lucide-react';
import OrderStatusBadge from './OrderStatusBadge';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_LIST } from '../../utils/constants';

/**
 * OrderTable Component
 * Data table for orders listing across Admin Dashboard and Customer history.
 * Supports status badge, inline status updating (for Admin), and inspection modal triggers.
 *
 * @param {Object} props
 * @param {Array} props.orders - Array of order objects
 * @param {Function} [props.onViewOrder] - (order) => void
 * @param {Function} [props.onUpdateStatus] - (orderId, newStatus) => Promise<void>
 * @param {Function} [props.onDeleteOrder] - (orderId) => Promise<void>
 * @param {boolean} [props.isAdmin=false] - Enables admin status dropdown and delete controls
 * @param {boolean} [props.loading=false]
 * @param {string} [props.emptyMessage='No orders found.']
 */
const OrderTable = ({
  orders = [],
  onViewOrder,
  onUpdateStatus,
  onDeleteOrder,
  isAdmin = false,
  loading = false,
  emptyMessage = 'No orders found.',
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-3" />
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Order ID</th>
            <th className="px-6 py-4">Date</th>
            {isAdmin && <th className="px-6 py-4">Customer</th>}
            <th className="px-6 py-4 text-center">Items</th>
            <th className="px-6 py-4 text-right">Total Amount</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => {
            const customerName =
              typeof order.user === 'object' && order.user?.name
                ? order.user.name
                : typeof order.user === 'string'
                ? order.user
                : order.user ? `User #${order.user}` : 'Guest';

            const itemCount =
              order.itemCount !== undefined
                ? order.itemCount
                : Array.isArray(order.items)
                ? order.items.reduce((acc, it) => acc + (it.quantity || 1), 0)
                : 1;

            return (
              <tr
                key={order.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {/* Order ID */}
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => onViewOrder && onViewOrder(order)}
                    className="font-mono font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5"
                    title="View order details"
                  >
                    <span>#{String(order.id).slice(0, 8)}&hellip;</span>
                  </button>
                </td>

                {/* Date */}
                <td className="px-6 py-4 text-slate-600 text-xs sm:text-sm">
                  {formatDate(order.created_at || order.date)}
                </td>

                {/* Customer (Admin only) */}
                {isAdmin && (
                  <td className="px-6 py-4 text-slate-800 font-medium">
                    {customerName}
                  </td>
                )}

                {/* Items Count */}
                <td className="px-6 py-4 text-center text-slate-600">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {itemCount}
                  </span>
                </td>

                {/* Total Price */}
                <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                  {formatPrice(order.total_price)}
                </td>

                {/* Status Column */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <OrderStatusBadge status={order.status} showDot={true} />

                    {/* Admin Status Quick Select */}
                    {isAdmin && onUpdateStatus && (
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                        className="bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 px-2 py-1 outline-none shadow-2xs cursor-pointer ml-1"
                        aria-label="Change order status"
                      >
                        {ORDER_STATUS_LIST.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onViewOrder && (
                      <button
                        type="button"
                        onClick={() => onViewOrder(order)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View details"
                        aria-label="View order details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {isAdmin && onDeleteOrder && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this order permanently?')) {
                            onDeleteOrder(order.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete order"
                        aria-label="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
