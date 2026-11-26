import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ClipboardList,
  Package,
  AlertTriangle,
  Download,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Clock,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../components/Dashboard/StatCard';
import OrderStatusBadge from '../components/Orders/OrderStatusBadge';
import OrderDetailsModal from '../components/Orders/OrderDetailsModal';
import { useOrders } from '../hooks/useOrders';
import productService from '../services/productService';
import { formatPrice, formatDate } from '../utils/formatters';

/**
 * Dashboard Page
 * Admin overview dashboard strictly adhering to nexamart_app.tsx design.
 * Features:
 * - 4 Key Performance Indicators (Revenue, Orders, Pending Shipments, Low Stock)
 * - Recent Orders Table with OrderDetailsModal invoice popup
 * - Critical Inventory alert section with quick Restock shortcuts
 * - Downloadable CSV store activity report
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { orders, loading: ordersLoading, refetchOrders } = useOrders({ autoFetch: true });

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch product inventory to evaluate low stock alerts
  useEffect(() => {
    let isMounted = true;
    const fetchInventory = async () => {
      setProductsLoading(true);
      try {
        const data = await productService.getProducts({ page_size: 50 });
        const list = Array.isArray(data) ? data : data?.results || [];
        if (isMounted) {
          setProducts(list);
        }
      } catch (err) {
        console.error('Failed to load inventory for admin dashboard:', err);
      } finally {
        if (isMounted) {
          setProductsLoading(false);
        }
      }
    };

    fetchInventory();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Metrics
  const totalRevenue = useMemo(() => {
    if (!Array.isArray(orders)) return 0;
    return orders
      .filter((o) => (o.status || '').toLowerCase() !== 'canceled')
      .reduce((sum, o) => sum + (Number(o.total_price || o.total || 0) || 0), 0);
  }, [orders]);

  const pendingShipments = useMemo(() => {
    if (!Array.isArray(orders)) return 0;
    return orders.filter((o) => {
      const st = (o.status || '').toLowerCase();
      return st === 'ready to ship' || st === 'processing' || st === 'not paid';
    }).length;
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((p) => Number(p.stock) <= 5);
  }, [products]);

  // Export CSV summary report
  const handleDownloadReport = () => {
    if (!orders || orders.length === 0) {
      alert('No order data available to generate report.');
      return;
    }

    const headers = ['Order ID', 'Customer', 'Date', 'Total (৳)', 'Status', 'Shipping Address'];
    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${typeof o.user === 'object' ? `${o.user?.first_name || ''} ${o.user?.last_name || ''}`.trim() || o.user?.name || o.user?.email || 'Customer' : (o.user ? `Customer #${o.user}` : 'Customer')}"`,
      `"${formatDate(o.created_at || o.date, { format: 'iso' })}"`,
      `"${Number(o.total_price ?? o.total ?? 0).toFixed(2)}"`,
      `"${o.status}"`,
      `"${(o.shipping_address || o.address || o.user?.address || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexaMart_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = ordersLoading || productsLoading;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refetchOrders}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Refresh statistics"
            aria-label="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={formatPrice(totalRevenue)}
          icon={TrendingUp}
          variant="emerald"
          change="+12.5%"
          changeText="vs last week"
          isPositive={true}
        />

        {/* Total Orders */}
        <StatCard
          title="Total Orders"
          value={orders?.length || 0}
          icon={ClipboardList}
          variant="blue"
          change="+5.2%"
          changeText="vs last week"
          isPositive={true}
          onClick={() => navigate('/admin/orders')}
        />

        {/* Pending Shipments */}
        <StatCard
          title="Pending Shipments"
          value={pendingShipments}
          icon={Package}
          variant="default"
          subtext="Require fulfillment"
          onClick={() => navigate('/admin/orders')}
        />

        {/* Low Stock Alerts */}
        <StatCard
          title="Low Stock Alerts"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          variant="amber"
          subtext="Review inventory"
          onClick={() => navigate('/admin/products')}
        />
      </div>

      {/* Main Grid: Recent Orders (2 cols) & Action Required (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Recent Orders Table (lg:col-span-2) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Recent Orders</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest customer transactions across all channels</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 group"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
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
                <p className="font-medium text-sm text-slate-500">No orders placed yet</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-3.5">Order ID</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
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

        {/* Right: Critical Inventory / Action Required (lg:col-span-1) */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>Action Required</span>
            </h3>
            {lowStockProducts.length > 0 && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {lowStockProducts.length} items
              </span>
            )}
          </div>

          <div className="p-3 flex-1 overflow-y-auto max-h-[460px]">
            {productsLoading ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  Inventory Healthy
                </h4>
                <p className="text-xs text-slate-400">
                  All items are adequately stocked above threshold.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockProducts.slice(0, 6).map((product) => {
                  const isZero = Number(product.stock) === 0;
                  const thumb = productService.getProductImage(product);

                  return (
                    <div
                      key={product.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          <img
                            src={thumb}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                'https://placehold.co/100x100/e2e8f0/475569?text=Item';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate max-w-[130px]">
                            {product.name}
                          </h4>
                          <p
                            className={`text-xs font-bold ${isZero ? 'text-rose-600' : 'text-amber-600'
                              }`}
                          >
                            {isZero ? 'Out of Stock' : `Only ${product.stock} left`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/admin/products`)}
                        className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl transition-all flex-shrink-0 cursor-pointer active:scale-95"
                      >
                        Restock
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <Link
              to="/admin/products"
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-1 transition-colors"
            >
              <span>Manage Entire Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
