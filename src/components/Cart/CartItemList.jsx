import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import CartItem from './CartItem';

/**
 * CartItemList Component
 * Container component that displays a responsive list/table of CartItem rows
 * with a table header, clear cart action, and navigation back to shop.
 * Strictly adheres to nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {Array} props.items - List of cart items
 * @param {Function} props.onUpdateQuantity - (itemId, newQuantity) => Promise<void>
 * @param {Function} props.onRemove - (itemId) => Promise<void>
 * @param {Function} [props.onClearCart] - () => Promise<void>
 * @param {boolean} [props.loading=false]
 */
const CartItemList = ({
  items = [],
  onUpdateQuantity,
  onRemove,
  onClearCart,
  loading = false,
}) => {
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    if (!onClearCart || clearing) return;
    if (window.confirm('Are you sure you want to empty your entire shopping cart?')) {
      setClearing(true);
      try {
        await onClearCart();
      } finally {
        setClearing(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Table Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header (Desktop only) */}
        <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
          <div className="col-span-6">Product Details</div>
          <div className="col-span-3 text-center">Quantity</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Cart Item Rows */}
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
              isUpdating={loading}
            />
          ))}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          {onClearCart && items.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={clearing || loading}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {clearing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  <span>Clearing Cart...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItemList;
