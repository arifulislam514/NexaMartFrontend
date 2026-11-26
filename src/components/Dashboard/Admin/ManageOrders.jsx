import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Loader2,
  X,
  Package,
  ChevronLeft,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useOrders } from '../../../hooks/useOrders';
import OrderStatusBadge from '../../Orders/OrderStatusBadge';
import OrderDetailsModal from '../../Orders/OrderDetailsModal';
import { formatPrice, formatDate } from '../../../utils/formatters';
import { ORDER_STATUS } from '../../../utils/constants';

/**
 * ManageOrders Component
 * Comprehensive order fulfillment hub for Admin Dashboard strictly matching nexamart_app.tsx design.
 * Features:
 * - Status filter tabs with live counters (All Orders, Not Paid, Ready To Ship, Shipped, Delivered, Canceled)
 * - Quick inline status updater dropdown calling PATCH /api/v1/orders/{id}/update_status/
 * - Search by Order ID, customer name, or email
 * - View Invoice modal popup with printable receipt and tracking steps
 * - CSV export report generator
 *
 * @param {Object} props
 * @param {string} [props.className='']
 */
const ManageOrders = ({ className = '' }) => {
  const { orders, loading, error, fetchOrders, updateStatus } = useOrders({ autoFetch: true });

  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const tabs = [
    'All Orders',
    ORDER_STATUS.NOT_PAID,
    ORDER_STATUS.READY_TO_SHIP,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELED,
  ];

  // Tab counters breakdown
  const statusCounts = useMemo(() => {
    const counts = { 'All Orders': 0 };
    tabs.forEach((t) => {
      if (t !== 'All Orders') counts[t] = 0;
    });

    if (!Array.isArray(orders)) return counts;

    counts['All Orders'] = orders.length;
    orders.forEach((o) => {
      const st = o.status;
      if (counts[st] !== undefined) {
        counts[st] = (counts[st] || 0) + 1;
      }
    });

    return counts;
  }, [orders, tabs]);

  // Filter orders by active tab and search query
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    let list = activeTab === 'All Orders' ? orders : orders.filter((o) => o.status === activeTab);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((o) => {
        const idMatch = String(o.id || '').toLowerCase().includes(q);
        const customerName =
          typeof o.user === 'object'
            ? `${o.user?.first_name || ''} ${o.user?.last_name || ''} ${o.user?.name || ''} ${o.user?.email || ''}`
            : String(o.user || '');
        const nameMatch = customerName.toLowerCase().includes(q);
        const addressMatch = String(o.shipping_address || o.address || o.user?.address || '').toLowerCase().includes(q);
        return idMatch || nameMatch || addressMatch;
      });
    }

    return list;
  }, [orders, activeTab, searchQuery]);

  // Paginated slice
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;

  // Handle Order Status change
  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;

    setUpdatingOrderId(orderId);
    try {
      await updateStatus(orderId, newStatus);
      const shortId = String(orderId).slice(0, 8);
      setFeedbackMessage({
        type: 'success',
        text: `Order #${shortId} status updated to "${newStatus}"!`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update order status.',
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Copy order UUID to clipboard
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    if (!filteredOrders.length) {
      alert('No orders available to export.');
      return;
    }

    const headers = ['Order ID', 'Date', 'Customer', 'Status', 'Items Count', 'Total (৳)', 'Address'];
    const rows = filteredOrders.map((o) => [
      `"${o.id}"`,
      `"${formatDate(o.created_at || o.date, { format: 'iso' })}"`,
      `"${typeof o.user === 'object' ? `${o.user?.first_name || ''} ${o.user?.last_name || ''}`.trim() || o.user?.name || o.user?.email || 'Customer' : (o.user ? `Customer #${o.user}` : 'Customer')}"`,
      `"${o.status}"`,
      `"${Array.isArray(o.items) ? o.items.length : 0}"`,
      `"${Number(o.total_price ?? o.total ?? 0).toFixed(2)}"`,
      `"${(o.shipping_address || o.address || o.user?.address || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexaMart_Orders_${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            View, track, and fulfill customer orders in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Refresh orders list"
            aria-label="Refresh orders list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-2xs border animate-fade-in ${
            feedbackMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            )}
            <span className="text-sm font-semibold">{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Order Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Status Filter Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar bg-slate-50/70">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            const count = statusCounts[tab] || 0;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`px-5 sm:px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Order ID, Customer, Address..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            />
          </div>

          <div className="text-xs text-slate-400 font-semibold">
            Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto min-h-[380px]">
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 mb-2">{error}</p>
              <button
                type="button"
                onClick={fetchOrders}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="font-bold text-slate-800 text-base mb-1">
                No orders found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No orders match your filter criteria for &quot;{activeTab}&quot;.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                  <th className="px-6 py-4">Live Status & Fulfill</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOrders.map((order) => {
                  const customerName =
                    typeof order.user === 'object'
                      ? `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.trim() ||
                        order.user?.name ||
                        order.user?.email ||
                        'Customer'
                      : order.user ? `Customer #${order.user}` : 'Customer';

                  const shortId = String(order.id).slice(0, 8);
                  const isUpdating = updatingOrderId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Order ID & Copy */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="font-mono font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                            title="View order details"
                          >
                            #{shortId}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyId(order.id)}
                            className="text-slate-300 hover:text-slate-600 transition-colors p-1"
                            title="Copy full UUID"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {formatDate(order.created_at || order.date, { format: 'medium' })}
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{customerName}</div>
                        {typeof order.user === 'object' && order.user?.email && (
                          <div className="text-xs text-slate-400 truncate max-w-[160px]">
                            {order.user.email}
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4 text-right">
                        <div className="font-extrabold text-slate-900">
                          {formatPrice(order.total_price ?? order.total)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {Array.isArray(order.items) ? `${order.items.length} items` : '1 item'}
                        </div>
                        {Array.isArray(order.sub_orders) && order.sub_orders.length > 0 && (
                          <div className="flex flex-wrap justify-end gap-1 mt-1">
                            {order.sub_orders.map((sub) => (
                              <span
                                key={sub.id}
                                className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 inline-flex items-center gap-1"
                                title={`Sub-order: ${sub.seller_store_name || 'Vendor'} (${sub.status})`}
                              >
                                <Store className="w-2.5 h-2.5 text-indigo-500" />
                                <span className="max-w-[90px] truncate">{sub.seller_store_name || 'Vendor'}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Live Status Badge & Fulfill Dropdown */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <OrderStatusBadge status={order.status} size="sm" />

                          {/* Quick Admin Fulfill Selector */}
                          <div className="relative">
                            <select
                              value={order.status}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 block px-3 py-1.5 outline-none shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                              <option value={ORDER_STATUS.NOT_PAID}>Not Paid</option>
                              <option value={ORDER_STATUS.READY_TO_SHIP}>Ready To Ship</option>
                              <option value={ORDER_STATUS.SHIPPED}>Shipped</option>
                              <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
                              <option value={ORDER_STATUS.CANCELED}>Canceled</option>
                            </select>

                            {isUpdating && (
                              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action Button: View Invoice */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 transition-all shadow-2xs active:scale-95 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredOrders.length > pageSize && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-medium">
            <span>
              Showing{' '}
              <strong className="text-slate-800">{(page - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-slate-800">
                {Math.min(page * pageSize, filteredOrders.length)}
              </strong>{' '}
              of <strong className="text-slate-800">{filteredOrders.length}</strong> orders
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs font-semibold text-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <span className="text-xs font-bold text-slate-700 px-2">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs font-semibold text-xs cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancelOrder={async (orderId) => {
            await handleStatusChange(orderId, ORDER_STATUS.CANCELED);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageOrders;
