import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Store,
  Clock,
  ClipboardList,
  Package,
  AlertTriangle,
  Download,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Percent,
  Tag,
  MessageSquare,
  Users,
  ExternalLink,
} from 'lucide-react';
import StatCard from '../components/Dashboard/StatCard';
import OrderStatusBadge from '../components/Orders/OrderStatusBadge';
import OrderDetailsModal from '../components/Orders/OrderDetailsModal';
import { useOrders } from '../hooks/useOrders';
import productService from '../services/productService';
import adminService from '../services/adminService';
import { formatPrice, formatDate } from '../utils/formatters';

/**
 * Dashboard Page
 * NexaMart Multi-Vendor Marketplace Operations & Admin Control Center.
 * Custom-tailored for Platform Administrators managing multiple vendor stores, global catalog,
 * commission earnings, and multi-seller sub-order fulfillment.
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { orders, loading: ordersLoading, refetchOrders } = useOrders({ autoFetch: true });

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [sellers, setSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [approvingSellerId, setApprovingSellerId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Fetch Inventory and Sellers
  const fetchDashboardData = useCallback(async () => {
    setProductsLoading(true);
    setSellersLoading(true);

    try {
      const [prodRes, sellRes] = await Promise.allSettled([
        productService.getProducts({ page_size: 50 }),
        adminService.getSellers(),
      ]);

      if (prodRes.status === 'fulfilled') {
        const pData = prodRes.value;
        const list = Array.isArray(pData) ? pData : pData?.results || [];
        setProducts(list);
      }

      if (sellRes.status === 'fulfilled') {
        const sData = sellRes.value;
        const sList = Array.isArray(sData) ? sData : sData?.results || [];
        setSellers(sList);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setProductsLoading(false);
      setSellersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Compute Platform Metrics
  const totalGMV = useMemo(() => {
    if (!Array.isArray(orders)) return 0;
    return orders
      .filter((o) => (o.status || '').toLowerCase() !== 'canceled')
      .reduce((sum, o) => sum + (Number(o.total_price || o.total || 0) || 0), 0);
  }, [orders]);

  // Estimated platform commission earnings (~10% platform take-rate)
  const estimatedCommissionRevenue = useMemo(() => {
    return totalGMV * 0.10;
  }, [totalGMV]);

  // Filter Pending & Approved Sellers
  const pendingSellers = useMemo(() => {
    if (!Array.isArray(sellers)) return [];
    return sellers.filter((s) => s.status === 'pending');
  }, [sellers]);

  const approvedSellers = useMemo(() => {
    if (!Array.isArray(sellers)) return [];
    return sellers.filter((s) => s.status === 'approved');
  }, [sellers]);

  // Quick 1-click approve seller from dashboard banner
  const handleQuickApproveSeller = async (sellerId, storeName) => {
    setApprovingSellerId(sellerId);
    try {
      await adminService.approveSeller(sellerId);
      setFeedback({ type: 'success', message: `Store "${storeName}" approved!` });
      setTimeout(() => setFeedback(null), 4000);
      fetchDashboardData();
    } catch (err) {
      console.error('Quick approve error:', err);
      setFeedback({ type: 'error', message: 'Failed to approve seller.' });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setApprovingSellerId(null);
    }
  };

  // Export CSV summary report
  const handleDownloadReport = () => {
    if (!orders || orders.length === 0) {
      alert('No order data available to generate report.');
      return;
    }

    const headers = [
      'Order ID',
      'Customer',
      'Date',
      'Gross Amount (৳)',
      'Est. Commission 10% (৳)',
      'Status',
      'Shipping Address',
    ];

    const rows = orders.map((o) => {
      const gross = Number(o.total_price ?? o.total ?? 0);
      const commission = (gross * 0.1).toFixed(2);
      const customer =
        typeof o.user === 'object'
          ? `${o.user?.first_name || ''} ${o.user?.last_name || ''}`.trim() ||
            o.user?.name ||
            o.user?.email ||
            'Customer'
          : o.user ? `Customer #${o.user}` : 'Customer';

      return [
        `"${o.id}"`,
        `"${customer}"`,
        `"${formatDate(o.created_at || o.date, { format: 'iso' })}"`,
        `"${gross.toFixed(2)}"`,
        `"${commission}"`,
        `"${o.status}"`,
        `"${(o.shipping_address || o.address || o.user?.address || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexaMart_Marketplace_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-8">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold border shadow-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1.5 border border-indigo-100">
            <Store className="w-3.5 h-3.5 text-indigo-600" />
            <span>Marketplace Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Platform Operations Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Global overview of merchant activity, multi-vendor catalog, platform commission, and orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              refetchOrders();
              fetchDashboardData();
            }}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Refresh statistics"
            aria-label="Refresh statistics"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                ordersLoading || productsLoading || sellersLoading ? 'animate-spin text-indigo-600' : ''
              }`}
            />
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Marketplace Report</span>
          </button>
        </div>
      </div>

      {/* High-Priority Pending Sellers Action Banner */}
      {pendingSellers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 bg-white p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200/80">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Action Required: {pendingSellers.length} Merchant Application{pendingSellers.length > 1 ? 's' : ''} Pending Review
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                New sellers have applied to join NexaMart. Verify store details and approve them to expand your marketplace offerings.
              </p>
            </div>
          </div>

          <Link
            to="/admin/sellers"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:scale-102 shrink-0 cursor-pointer"
          >
            <span>Review Applications</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 4 Marketplace KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Marketplace GMV */}
        <StatCard
          title="Marketplace GMV"
          value={formatPrice(totalGMV)}
          icon={TrendingUp}
          variant="emerald"
          change="+14.2%"
          changeText="gross merchandise volume"
          isPositive={true}
        />

        {/* Platform Commission Earned */}
        <StatCard
          title="Platform Commission"
          value={formatPrice(estimatedCommissionRevenue)}
          icon={Percent}
          variant="blue"
          subtext="Net platform revenue (10%)"
        />

        {/* Verified Vendors */}
        <StatCard
          title="Active Vendors"
          value={approvedSellers.length}
          icon={Store}
          variant="indigo"
          subtext={`${sellers.length} total registered stores`}
          onClick={() => navigate('/admin/sellers')}
        />

        {/* Pending Approvals */}
        <StatCard
          title="Pending Approvals"
          value={pendingSellers.length}
          icon={Clock}
          variant={pendingSellers.length > 0 ? 'amber' : 'default'}
          subtext={pendingSellers.length > 0 ? 'Requires moderation' : 'All caught up'}
          onClick={() => navigate('/admin/sellers')}
        />
      </div>

      {/* Quick Admin Navigation Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Manage Vendors', path: '/admin/sellers', icon: Store, color: 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100/70' },
          { label: 'All Products', path: '/admin/products', icon: Package, color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100/70' },
          { label: 'Categories', path: '/admin/categories', icon: Tag, color: 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100/70' },
          { label: 'Review Moderation', path: '/admin/reviews', icon: MessageSquare, color: 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100/70' },
          { label: 'Users & Staff', path: '/admin/users', icon: Users, color: 'text-slate-700 bg-slate-100 border-slate-200 hover:bg-slate-200/70' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all shadow-2xs group hover:-translate-y-0.5 cursor-pointer ${item.color}`}
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-xs font-bold leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Recent Orders (2 cols) & Vendor Pipeline / Alerts (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Recent Marketplace Orders (lg:col-span-2) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Recent Marketplace Orders
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-vendor customer transactions across all stores
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {orders.length} total orders
            </span>
          </div>

          <div className="overflow-x-auto">
            {ordersLoading ? (
              <div className="p-8 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-medium text-sm text-slate-500">No marketplace orders placed yet</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-3.5">Order ID</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Gross Total</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 6).map((order) => {
                    const customerName =
                      typeof order.user === 'object'
                        ? `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.trim() ||
                          order.user?.name ||
                          order.user?.email ||
                          'Customer'
                        : order.user ? `Customer #${order.user}` : 'Customer';

                    const shortId = String(order.id).slice(0, 8);

                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600 group-hover:underline">
                          #{shortId}
                        </td>
                        <td className="px-6 py-4 text-slate-800 font-medium">
                          {customerName}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {formatDate(order.created_at || order.date, { format: 'medium' })}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 text-right">
                          {formatPrice(order.total_price ?? order.total)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <OrderStatusBadge status={order.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Vendor Onboarding Pipeline & Inventory Health (lg:col-span-1) */}
        <div className="space-y-6">
          {/* Pending Applications Box */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Vendor Pipeline</span>
              </h3>
              <Link
                to="/admin/sellers"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                View All
              </Link>
            </div>

            <div className="p-4 divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {sellersLoading ? (
                <div className="p-4 space-y-2 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              ) : pendingSellers.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  <p className="font-bold text-xs text-slate-700">No Pending Applications</p>
                  <p className="text-[11px] text-slate-400">All merchant stores are reviewed.</p>
                </div>
              ) : (
                pendingSellers.slice(0, 4).map((seller) => (
                  <div
                    key={seller.id}
                    className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {seller.store_name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {seller.user_email || 'No email'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={approvingSellerId === seller.id}
                        onClick={() => handleQuickApproveSeller(seller.id, seller.store_name)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        {approvingSellerId === seller.id ? '...' : 'Approve'}
                      </button>
                      <Link
                        to="/admin/sellers"
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Stores Directory Summary */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Active Stores</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {approvedSellers.length} active
              </span>
            </div>

            <div className="p-4 divide-y divide-slate-100 max-h-[260px] overflow-y-auto">
              {sellersLoading ? (
                <div className="p-3 space-y-2 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              ) : approvedSellers.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  <p className="font-bold text-xs text-slate-700">No active stores</p>
                </div>
              ) : (
                approvedSellers.slice(0, 5).map((seller) => (
                  <div
                    key={seller.id}
                    className="py-2.5 flex items-center justify-between gap-2 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {seller.store_name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        Commission: {seller.commission_rate || '10'}%
                      </p>
                    </div>

                    <Link
                      to={`/stores/${seller.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View Public Storefront"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice / Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
