import React, { useEffect } from 'react';
import useCart from '../hooks/useCart';
import CartItemList from '../components/Cart/CartItemList';
import CartSummary from '../components/Cart/CartSummary';
import EmptyCart from '../components/Cart/EmptyCart';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';

/**
 * Cart Page
 * Main shopping cart screen strictly following nexamart_app.tsx design.
 * Integrates global CartContext, CartItemList, and CartSummary.
 */
const Cart = () => {
  const {
    items,
    itemCount,
    subtotal,
    loading,
    actionLoading,
    error,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  } = useCart();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Loading State
  if (loading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4">
        <LoadingSpinner size="lg" message="Loading your shopping cart..." />
      </div>
    );
  }

  // Empty Cart State
  if (!loading && items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page Title & Item Count */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <span className="text-base sm:text-lg text-slate-500 font-medium">
            ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          Review your selected items and proceed to secure checkout.
        </p>
      </div>

      {/* Global Cart Error Banner */}
      {error && (
        <div className="mb-6">
          <ErrorAlert
            message={error}
            onRetry={refreshCart}
          />
        </div>
      )}

      {/* Main 2-Column Cart Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:w-2/3 w-full">
          <CartItemList
            items={items}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onClearCart={clearCart}
            loading={actionLoading}
          />

          {/* Trust Guarantees Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-600 text-xs">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Fast Doorstep Delivery in BD</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>30-Day Hassle-Free Returns</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>100% Genuine Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:w-1/3 w-full">
          <CartSummary
            subtotal={subtotal}
            itemCount={itemCount}
            shipping={15}
            loading={actionLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
