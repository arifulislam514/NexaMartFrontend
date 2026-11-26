import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Clock,
  Percent,
  CheckCircle2,
  Package,
  Plus,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  Truck,
  ExternalLink,
  Store,
  Tag,
  Settings,
} from 'lucide-react';
import sellerService from '../../services/sellerService';
import useAuth from '../../hooks/useAuth';
import { formatPrice, formatDate } from '../../utils/formatters';

/**
 * SellerDashboard Component (Overview & Earnings)
 * Displays 4 KPI Stat Cards:
 * 1. Net Earnings (delivered orders net income)
 * 2. Pending Earnings (processing orders pending payouts)
 * 3. Platform Commission (total commission paid)
 * 4. Delivered Orders (successful shipments count)
 * Plus recent orders preview and quick shortcuts.
 * Path: /seller/dashboard
 */
const SellerDashboard = () => {
  const { sellerProfile } = useAuth();

  const [earnings, setEarnings] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [earningsData, ordersData] = await Promise.all([
        sellerService.getEarnings(),
        sellerService.getSellerOrders({ page_size: 5 }),
      ]);
      setEarnings(earningsData);
      const ordersList = Array.isArray(ordersData) ? ordersData : ordersData?.results || [];
      setRecentOrders(ordersList);
    } catch (err) {
      console.error('Failed to load seller dashboard data:', err);
      setError('Failed to load earnings summary. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading merchant performance...</p>
      </div>
    );
  }

  const netEarnings = Number(earnings?.net_earnings || 0);
  const pendingEarnings = Number(earnings?.pending_earnings || 0);
  const commissionPaid = Number(earnings?.total_commission_paid || 0);
  const deliveredCount = Number(earnings?.delivered_sub_orders || 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Merchant Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Overview & Earnings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Store performance for <strong className="text-slate-800">"{sellerProfile?.store_name}"</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="p-2.5 text-slate-600 hover:text-emerald-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Financials"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/seller/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Net Earnings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Net Earnings
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatPrice(netEarnings)}
          </p>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Settled delivered order income
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        </div>

        {/* 2. Pending Earnings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Earnings
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatPrice(pendingEarnings)}
          </p>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> In-transit / processing packages
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        </div>

        {/* 3. Platform Commission */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Platform Fee ({sellerProfile?.commission_rate || '10'}%)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatPrice(commissionPaid)}
          </p>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
            Platform logistics & gateway fee
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        </div>

        {/* 4. Delivered Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Delivered Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {deliveredCount}
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Total {earnings?.total_sub_orders || 0} sub-orders placed
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        </div>
      </div>

      {/* Quick Merchant Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/seller/products"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex items-center gap-3 group shadow-2xs"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Manage Catalog</p>
            <p className="text-[11px] text-slate-400">Products & stock</p>
          </div>
        </Link>

        <Link
          to="/seller/orders"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center gap-3 group shadow-2xs"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Fulfill Orders</p>
            <p className="text-[11px] text-slate-400">Track shipments</p>
          </div>
        </Link>

        <Link
          to="/seller/coupons"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all flex items-center gap-3 group shadow-2xs"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Store Coupons</p>
            <p className="text-[11px] text-slate-400">Create discounts</p>
          </div>
        </Link>

        <Link
          to="/seller/settings"
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex items-center gap-3 group shadow-2xs"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Store Settings</p>
            <p className="text-[11px] text-slate-400">Profile & logo</p>
          </div>
        </Link>
      </div>

      {/* Recent SubOrders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500">Latest packages containing your items</p>
          </div>

          <Link
            to="/seller/orders"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No customer orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-6">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Net Earning</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                      #{String(o.id).slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(o.created_at || o.order_created_at, { format: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {o.buyer_name || 'Customer'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatPrice(o.subtotal)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                      {formatPrice(o.seller_earning)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to="/seller/orders"
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
