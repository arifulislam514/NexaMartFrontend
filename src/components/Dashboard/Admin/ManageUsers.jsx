import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Package,
  RefreshCw,
  Eye,
  X,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useOrders } from '../../../hooks/useOrders';
import useAuth from '../../../hooks/useAuth';
import { formatPrice, formatDate } from '../../../utils/formatters';

/**
 * ManageUsers Component
 * Customer Directory table for Admin Dashboard matching nexamart_app.tsx design.
 * Consolidates customer profiles, order counts, lifetime values, and role badges.
 */
const ManageUsers = ({ className = '' }) => {
  const { user: currentAdmin } = useAuth();
  const { orders, loading, fetchOrders } = useOrders({ autoFetch: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Aggregate unique customers from orders and current user
  const customers = useMemo(() => {
    const customerMap = new Map();

    // Add current admin if exists
    if (currentAdmin) {
      customerMap.set(currentAdmin.email || 'admin', {
        id: currentAdmin.id || 'admin',
        name: [currentAdmin.first_name, currentAdmin.last_name].filter(Boolean).join(' ') || currentAdmin.name || 'Admin',
        email: currentAdmin.email || 'admin@nexamart.com',
        phone: currentAdmin.phone_number || 'N/A',
        address: currentAdmin.address || 'Headquarters',
        is_staff: true,
        orderCount: 0,
        totalSpent: 0,
        orders: [],
        lastActive: new Date().toISOString(),
      });
    }

    // Extract customers from orders
    if (Array.isArray(orders)) {
      orders.forEach((order) => {
        const email =
          typeof order.user === 'object'
            ? order.user?.email || order.user?.name || `user-${order.id}`
            : order.user || `user-${order.id}`;

        const name =
          typeof order.user === 'object'
            ? order.user?.name || order.user?.email
            : order.user || 'Customer';

        const phone = order.phone_number || 'N/A';
        const address = order.shipping_address || order.address || 'N/A';

        const isStaffUser = Boolean(
          typeof order.user === 'object'
            ? order.user?.is_staff || order.user?.is_superuser || order.user?.role === 'admin'
            : false
        );

        if (!customerMap.has(email)) {
          customerMap.set(email, {
            id: typeof order.user === 'object' ? order.user?.id : order.user || `cust-${customerMap.size + 1}`,
            name,
            email,
            phone,
            address,
            is_staff: isStaffUser,
            orderCount: 1,
            totalSpent: Number(order.total_price || order.total || 0),
            orders: [order],
            lastActive: order.created_at || order.date,
          });
        } else {
          const existing = customerMap.get(email);
          existing.orderCount += 1;
          existing.totalSpent += Number(order.total_price || order.total || 0);
          existing.orders.push(order);
          if (phone !== 'N/A' && existing.phone === 'N/A') existing.phone = phone;
          if (address !== 'N/A' && existing.address === 'N/A') existing.address = address;
        }
      });
    }

    return Array.from(customerMap.values());
  }, [orders, currentAdmin]);

  // Metrics
  const { totalCustomers, totalLtv, avgSpent } = useMemo(() => {
    const total = customers.length;
    const ltv = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avg = total > 0 ? ltv / total : 0;
    return { totalCustomers: total, totalLtv: ltv, avgSpent: avg };
  }, [customers]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    let list = customers;

    if (roleFilter === 'admin') {
      list = list.filter((c) => c.is_staff);
    } else if (roleFilter === 'customer') {
      list = list.filter((c) => !c.is_staff);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(q);
        const emailMatch = c.email.toLowerCase().includes(q);
        const phoneMatch = c.phone.toLowerCase().includes(q);
        const addressMatch = c.address.toLowerCase().includes(q);
        return nameMatch || emailMatch || phoneMatch || addressMatch;
      });
    }

    return list;
  }, [customers, roleFilter, searchQuery]);

  return (
    <div className={`p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse registered shoppers, lifetime spend, order histories, and contact info.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="self-start sm:self-auto p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          title="Refresh customers"
          aria-label="Refresh customers"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Customers</p>
            <h3 className="text-2xl font-black text-slate-900">{totalCustomers}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Lifetime Value</p>
            <h3 className="text-2xl font-black text-slate-900">{formatPrice(totalLtv)}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Average Spend</p>
            <h3 className="text-2xl font-black text-slate-900">{formatPrice(avgSpent)}</h3>
          </div>
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, or address..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 px-3.5 py-2 outline-none font-medium cursor-pointer shadow-2xs"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers Only</option>
              <option value="admin">Admin / Staff</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto min-h-[350px]">
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="font-bold text-slate-800 text-base mb-1">
                No customers found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No users match your active filter search.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4 text-right">Lifetime Spent</th>
                  <th className="px-6 py-4 text-center">Role</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => {
                  const initial = (cust.name.charAt(0) || 'U').toUpperCase();

                  return (
                    <tr
                      key={cust.email}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCustomer(cust)}
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                              {cust.name}
                            </span>
                            <span className="text-xs text-slate-400">{cust.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {cust.phone}
                      </td>

                      {/* Address */}
                      <td className="px-6 py-4">
                        <span className="text-slate-600 text-xs max-w-xs truncate block">
                          {cust.address}
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {cust.orderCount} {cust.orderCount === 1 ? 'order' : 'orders'}
                        </span>
                      </td>

                      {/* Lifetime Spent */}
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {formatPrice(cust.totalSpent)}
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4 text-center">
                        {cust.is_staff ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Staff</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Customer</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(cust);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View customer profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Customer Details Modal Popup */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-sm divide-y divide-slate-100">
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400 font-medium">Customer Role</span>
                <span className="font-bold text-slate-800">
                  {selectedCustomer.is_staff ? 'Administrator Staff' : 'Verified Customer'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="text-slate-400 font-medium">Phone Number</span>
                <span className="font-mono text-slate-800 font-semibold">{selectedCustomer.phone}</span>
              </div>

              <div className="flex justify-between items-start pt-3">
                <span className="text-slate-400 font-medium">Delivery Address</span>
                <span className="text-slate-800 font-medium text-right max-w-xs">{selectedCustomer.address}</span>
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="text-slate-400 font-medium">Orders Placed</span>
                <span className="font-bold text-indigo-600">{selectedCustomer.orderCount} orders</span>
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="text-slate-400 font-medium">Total Spend</span>
                <span className="font-black text-slate-900 text-base">{formatPrice(selectedCustomer.totalSpent)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
