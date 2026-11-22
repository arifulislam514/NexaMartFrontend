import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Package, CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import useOrders from '../hooks/useOrders';
import OrderCard from '../components/Orders/OrderCard';
import OrderDetailsModal from '../components/Orders/OrderDetailsModal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';

/**
 * Orders Page (Customer Order History & Tracking)
 * Displays order tracking milestones, receipts, and order cancellations.
 * Strictly adheres to nexamart_app.tsx design.
 */
const Orders = () => {
  const location = useLocation();
  const { orders, loading, error, fetchOrders, cancelOrder } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('All Orders');
  const [successBanner, setSuccessBanner] = useState(
    Boolean(location.state?.newOrderPlaced)
  );

  const statusTabs = [
    'All Orders',
    'Not Paid',
    'Ready To Ship',
    'Shipped',
    'Delivered',
    'Canceled',
  ];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filter orders by active tab
  const filteredOrders =
    activeTab === 'All Orders'
      ? orders
      : orders.filter((o) => o.status === activeTab);

  const handleCancelOrder = async (orderId) => {
    await cancelOrder(orderId);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
    }
  };

  // Loading State
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4">
        <LoadingSpinner size="lg" message="Loading your order history..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track order fulfillment milestones, review invoices, and manage past purchases.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-sm rounded-xl transition-all shadow-2xs"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Success Notification (when redirected from Checkout) */}
      {successBanner && (
        <div className="mb-8 p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start justify-between gap-4 animate-scale-up">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950 text-base">
                Order Placed Successfully!
              </h4>
              <p className="text-sm text-emerald-800 mt-0.5">
                Thank you for shopping with NexaMart. Your order has been placed and is currently being prepared for delivery.
                {location.state?.orderId && (
                  <span className="font-mono ml-1 font-semibold">
                    (ID: #{String(location.state.orderId).slice(0, 8)})
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1 rounded-md"
            aria-label="Dismiss banner"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} onRetry={fetchOrders} />
        </div>
      )}

      {/* Status Filter Tabs */}
      {orders.length > 0 && (
        <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar mb-8 gap-2 pb-1">
          {statusTabs.map((tab) => {
            const count =
              tab === 'All Orders'
                ? orders.length
                : orders.filter((o) => o.status === tab).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Orders List / Empty State */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Package className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">
            Looks like you haven&apos;t placed any orders yet. Discover our catalog and find something you love!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
          <p className="text-sm font-medium">
            No orders found under status &ldquo;{activeTab}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('All Orders')}
            className="mt-3 text-sm font-bold text-indigo-600 hover:underline"
          >
            View all orders
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={(ord) => setSelectedOrder(ord)}
              onCancelOrder={handleCancelOrder}
            />
          ))}
        </div>
      )}

      {/* Order Details Invoice Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancelOrder={handleCancelOrder}
        />
      )}
    </div>
  );
};

export default Orders;
