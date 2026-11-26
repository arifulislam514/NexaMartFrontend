import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Calendar,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import sellerService from '../../services/sellerService';
import OrderFulfillmentModal from '../../components/seller/OrderFulfillmentModal';
import { formatPrice, formatDate } from '../../utils/formatters';

/**
 * SellerOrders Page
 * Manages SubOrders specifically containing products from this seller.
 * Supports status tabs, live search, and inline fulfillment updating.
 * Path: /seller/orders
 */
const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter Tabs
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fulfillment Modal
  const [selectedSubOrder, setSelectedSubOrder] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const tabs = ['All', 'pending', 'confirmed', 'shipped', 'delivered', 'canceled'];

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeTab !== 'All') {
        params.status = activeTab;
      }
      const data = await sellerService.getSellerOrders(params);
      const list = Array.isArray(data) ? data : data?.results || [];
      setOrders(list);
    } catch (err) {
      console.error('Failed to load seller sub-orders:', err);
      setError(err.response?.data?.detail || 'Failed to load customer orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Tab counters breakdown
  const statusCounts = useMemo(() => {
    const counts = { All: orders.length };
    tabs.forEach((t) => {
      if (t !== 'All') counts[t] = 0;
    });

    orders.forEach((o) => {
      const st = (o.status || '').toLowerCase();
      if (counts[st] !== undefined) {
        counts[st] = (counts[st] || 0) + 1;
      }
    });

    return counts;
  }, [orders]);

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    if (!searchQuery.trim()) return orders;

    const q = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      const idMatch = String(o.id || '').toLowerCase().includes(q);
      const buyerMatch = String(o.buyer_name || o.buyer_email || '').toLowerCase().includes(q);
      const trkMatch = String(o.tracking_number || '').toLowerCase().includes(q);
      const phoneMatch = String(o.buyer_phone || '').includes(q);
      return idMatch || buyerMatch || trkMatch || phoneMatch;
    });
  }, [orders, searchQuery]);

  // Paginated slice
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  // Render Status Badge
  const renderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fulfill individual packages containing items from your store and track delivery steps.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const count = statusCounts[tab] !== undefined ? statusCounts[tab] : 0;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="capitalize">{tab}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by SubOrder ID, buyer name, phone, or tracking number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
          />
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No orders found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No sub-orders match your search query.'
                : `No orders currently found in '${activeTab}' status.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">SubOrder / Date</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Package Items</th>
                  <th className="py-3.5 px-4">Subtotal / Earnings</th>
                  <th className="py-3.5 px-4">Status & Tracking</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedOrders.map((order) => {
                  const itemCount = Array.isArray(order.items)
                    ? order.items.reduce((sum, it) => sum + (it.quantity || 1), 0)
                    : 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* SubOrder ID & Date */}
                      <td className="py-4 px-6">
                        <p className="font-bold font-mono text-slate-900 text-xs">
                          #{String(order.id).slice(0, 8)}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(order.created_at || order.order_created_at, { format: 'short' })}
                        </p>
                      </td>

                      {/* Customer Details */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[150px]">
                          {order.buyer_name || 'Buyer'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {order.buyer_phone || order.buyer_email || 'N/A'}
                        </p>
                      </td>

                      {/* Package Items */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      {/* Subtotal / Earning */}
                      <td className="py-4 px-4">
                        <p className="font-extrabold text-slate-900 text-xs">
                          {formatPrice(order.subtotal)}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                          Net: {formatPrice(order.seller_earning)}
                        </p>
                      </td>

                      {/* Status & Tracking */}
                      <td className="py-4 px-4 space-y-1">
                        <div>{renderStatusBadge(order.status)}</div>
                        {order.tracking_number ? (
                          <p className="text-[11px] font-mono font-semibold text-slate-500">
                            TRK: {order.tracking_number}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">No tracking yet</p>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedSubOrder(order)}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Fulfill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50/50">
            <span>
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length} orders
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fulfillment Status & Tracking Modal */}
      {selectedSubOrder && (
        <OrderFulfillmentModal
          subOrder={selectedSubOrder}
          onClose={() => setSelectedSubOrder(null)}
          onSuccess={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};

export default SellerOrders;
