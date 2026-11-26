import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Percent,
  RefreshCw,
  Mail,
  Phone,
  Package,
  Calendar,
  X,
  Loader2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import adminService from '../../../services/adminService';
import { formatDate } from '../../../utils/formatters';

/**
 * ManageSellers Component
 * Specialized vendor management & moderation hub for Marketplace Admins.
 * Allows approving pending seller applications, suspending vendors, and customizing commission rates.
 */
const ManageSellers = ({ className = '' }) => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'suspended'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action States
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [editingCommissionSeller, setEditingCommissionSeller] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch Sellers from API
  const fetchSellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const data = await adminService.getSellers(params);
      const list = Array.isArray(data) ? data : data?.results || [];
      setSellers(list);
    } catch (err) {
      console.error('Failed to load sellers:', err);
      setError('Failed to fetch marketplace vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  // Dynamic status counters
  const counters = useMemo(() => {
    const counts = { all: 0, pending: 0, approved: 0, suspended: 0 };
    if (!Array.isArray(sellers)) return counts;

    // If activeTab is 'all', compute directly from current list
    if (activeTab === 'all') {
      counts.all = sellers.length;
      sellers.forEach((s) => {
        if (counts[s.status] !== undefined) {
          counts[s.status] += 1;
        }
      });
    } else {
      counts[activeTab] = sellers.length;
    }
    return counts;
  }, [sellers, activeTab]);

  // Show temporary toast feedback
  const triggerFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handler: Approve Seller
  const handleApprove = async (seller) => {
    setActionLoading(true);
    try {
      await adminService.approveSeller(seller.id);
      triggerFeedback('success', `Store "${seller.store_name}" has been approved!`);
      fetchSellers();
      if (selectedSeller?.id === seller.id) {
        setSelectedSeller((prev) => ({ ...prev, status: 'approved' }));
      }
    } catch (err) {
      console.error('Approve seller error:', err);
      triggerFeedback('error', 'Failed to approve seller application.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Suspend Seller
  const handleSuspend = async (seller) => {
    setActionLoading(true);
    try {
      await adminService.suspendSeller(seller.id);
      triggerFeedback('info', `Store "${seller.store_name}" has been suspended.`);
      fetchSellers();
      if (selectedSeller?.id === seller.id) {
        setSelectedSeller((prev) => ({ ...prev, status: 'suspended' }));
      }
    } catch (err) {
      console.error('Suspend seller error:', err);
      triggerFeedback('error', 'Failed to suspend seller.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Update Commission Rate
  const handleUpdateCommission = async (e) => {
    e.preventDefault();
    if (!editingCommissionSeller) return;

    const rate = parseFloat(newCommissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      triggerFeedback('error', 'Please enter a valid commission rate (0% - 100%).');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.updateSeller(editingCommissionSeller.id, {
        commission_rate: rate.toFixed(2),
      });
      triggerFeedback('success', `Commission rate for "${editingCommissionSeller.store_name}" set to ${rate}%.`);
      setEditingCommissionSeller(null);
      setNewCommissionRate('');
      fetchSellers();
    } catch (err) {
      console.error('Update commission error:', err);
      triggerFeedback('error', 'Failed to update commission rate.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border shadow-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Store className="w-7 h-7 text-indigo-600" />
            Marketplace Vendors
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review onboarding applications, verify merchant stores, and regulate platform commissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSellers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Vendors', count: counters.all },
              { id: 'pending', label: 'Pending Review', count: counters.pending, highlight: true },
              { id: 'approved', label: 'Approved', count: counters.approved },
              { id: 'suspended', label: 'Suspended', count: counters.suspended },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.highlight && tab.count > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  {tab.count > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.highlight
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store, owner or phone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading marketplace vendors...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">{error}</p>
            <button
              type="button"
              onClick={fetchSellers}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100"
            >
              Try Again
            </button>
          </div>
        ) : sellers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Store className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">No vendors found</p>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {activeTab === 'pending'
                ? 'Great! There are no pending seller applications awaiting review.'
                : 'No vendors match your search criteria or filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Store Profile</th>
                  <th className="py-3.5 px-4">Merchant Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Commission</th>
                  <th className="py-3.5 px-4 text-center">Products</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sellers.map((seller) => (
                  <tr
                    key={seller.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedSeller(seller)}
                  >
                    {/* Store Profile */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {seller.logo ? (
                            <img
                              src={seller.logo}
                              alt={seller.store_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Store className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                            <span>{seller.store_name}</span>
                            {seller.status === 'approved' && (
                              <Link
                                to={`/stores/${seller.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-indigo-600"
                                title="View live storefront"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-mono">
                            /{seller.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Merchant Contact */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <div className="font-medium text-slate-800 text-xs flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{seller.user_email || 'No email'}</span>
                        </div>
                        {seller.phone && (
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{seller.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">{getStatusBadge(seller.status)}</td>

                    {/* Commission Rate */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCommissionSeller(seller);
                          setNewCommissionRate(seller.commission_rate || '10.00');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                        title="Click to modify commission rate"
                      >
                        <Percent className="w-3 h-3" />
                        <span>{seller.commission_rate ?? '10.00'}%</span>
                      </button>
                    </td>

                    {/* Total Products */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        <Package className="w-3 h-3 text-slate-400" />
                        {seller.total_products ?? 0}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {formatDate(seller.created_at, { format: 'medium' })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {seller.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleApprove(seller)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs hover:scale-102 cursor-pointer disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleSuspend(seller)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        ) : seller.status === 'approved' ? (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleSuspend(seller)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleApprove(seller)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seller Details Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {selectedSeller.logo ? (
                    <img
                      src={selectedSeller.logo}
                      alt={selectedSeller.store_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-7 h-7 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedSeller.store_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    store_slug: {selectedSeller.slug}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSeller(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Status
                </span>
                <div className="mt-1">{getStatusBadge(selectedSeller.status)}</div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Commission Rate
                </span>
                <span className="font-bold text-slate-800 text-sm mt-1 block">
                  {selectedSeller.commission_rate ?? '10.00'}%
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Owner Email
                </span>
                <span className="font-medium text-slate-800 text-xs mt-1 block">
                  {selectedSeller.user_email || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Phone Number
                </span>
                <span className="font-medium text-slate-800 text-xs mt-1 block">
                  {selectedSeller.phone || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Catalog Products
                </span>
                <span className="font-bold text-slate-800 text-sm mt-1 block">
                  {selectedSeller.total_products ?? 0} item(s)
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Application Date
                </span>
                <span className="font-medium text-slate-800 text-xs mt-1 block">
                  {formatDate(selectedSeller.created_at, { format: 'full' })}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Store Description
              </span>
              <p className="text-sm text-slate-600 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                {selectedSeller.description || 'No description provided by merchant.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {selectedSeller.status === 'approved' ? (
                <Link
                  to={`/stores/${selectedSeller.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-xs font-bold cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Public Storefront</span>
                </Link>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                {selectedSeller.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleApprove(selectedSeller)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                    >
                      Approve Store
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleSuspend(selectedSeller)}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Reject Application
                    </button>
                  </>
                ) : selectedSeller.status === 'approved' ? (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleSuspend(selectedSeller)}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    Suspend Store
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleApprove(selectedSeller)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                  >
                    Reactivate Store
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commission Rate Modal */}
      {editingCommissionSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleUpdateCommission}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Update Commission Rate
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set platform commission percentage for &quot;{editingCommissionSeller.store_name}&quot;.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCommissionSeller(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Commission Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(e.target.value)}
                  placeholder="e.g. 10.00"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pr-10"
                />
                <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Default marketplace commission rate is 10.00%.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingCommissionSeller(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Rate'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageSellers;
