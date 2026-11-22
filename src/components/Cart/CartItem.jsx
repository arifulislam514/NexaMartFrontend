import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Loader2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import productService from '../../services/productService';

/**
 * CartItem Component
 * Renders a single cart line item matching nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {Object} props.item - Cart item object { id, product, quantity, total_price }
 * @param {Function} props.onUpdateQuantity - (itemId, newQuantity) => Promise<void>
 * @param {Function} props.onRemove - (itemId) => Promise<void>
 * @param {boolean} [props.isUpdating=false]
 */
const CartItem = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}) => {
  const [localUpdating, setLocalUpdating] = useState(false);
  const [localRemoving, setLocalRemoving] = useState(false);

  if (!item || !item.product) return null;

  const { product, quantity = 1 } = item;
  const productImage = productService.getProductImage(product);

  const categoryLabel =
    typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : product.category_name ||
        (typeof product.category === 'string' ? product.category : 'General');

  // Price calculations
  const unitPrice = Number(product.price || 0);
  const lineTotal =
    item.total_price !== undefined
      ? Number(item.total_price)
      : unitPrice * quantity;

  const maxStock = product.stock !== undefined ? product.stock : 99;
  const isBusy = isUpdating || localUpdating || localRemoving;

  const handleDecrease = async () => {
    if (isBusy || quantity <= 1) return;
    setLocalUpdating(true);
    try {
      await onUpdateQuantity(item.id, quantity - 1);
    } finally {
      setLocalUpdating(false);
    }
  };

  const handleIncrease = async () => {
    if (isBusy || quantity >= maxStock) return;
    setLocalUpdating(true);
    try {
      await onUpdateQuantity(item.id, quantity + 1);
    } finally {
      setLocalUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isBusy) return;
    setLocalRemoving(true);
    try {
      await onRemove(item.id);
    } finally {
      setLocalRemoving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center group transition-colors hover:bg-slate-50/50">
      {/* 1. Product Info Column (col-span-6) */}
      <div className="col-span-6 flex gap-4 w-full items-center">
        <Link
          to={`/products/${product.id}`}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200/80 block group-hover:border-indigo-300 transition-colors"
        >
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        <div className="flex flex-col justify-center min-w-0 flex-1">
          <Link
            to={`/products/${product.id}`}
            className="font-bold text-slate-900 text-base sm:text-lg hover:text-indigo-600 transition-colors line-clamp-1 truncate"
            title={product.name}
          >
            {product.name}
          </Link>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              {categoryLabel}
            </span>
            <span className="text-xs text-slate-400">
              {formatPrice(unitPrice)} each
            </span>
          </div>

          {quantity >= maxStock && maxStock > 0 && (
            <span className="text-[11px] text-amber-600 font-medium mt-1">
              Max stock reached ({maxStock})
            </span>
          )}
        </div>
      </div>

      {/* 2. Quantity Control Column (col-span-3) */}
      <div className="col-span-3 w-full sm:w-auto flex justify-between sm:justify-center items-center">
        <span className="text-xs font-semibold text-slate-500 sm:hidden">
          Quantity:
        </span>
        <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-10 w-32 shadow-2xs">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={isBusy || quantity <= 1}
            className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-base font-bold select-none"
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <div className="flex-1 text-center font-bold text-slate-900 text-sm">
            {localUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-indigo-600" />
            ) : (
              quantity
            )}
          </div>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={isBusy || quantity >= maxStock}
            className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-base font-bold select-none"
            aria-label="Increase quantity"
          >
            &#43;
          </button>
        </div>
      </div>

      {/* 3. Total Line Price Column (col-span-2) */}
      <div className="col-span-2 w-full sm:w-auto flex justify-between sm:justify-end items-center sm:text-right">
        <span className="text-xs font-semibold text-slate-500 sm:hidden">
          Total:
        </span>
        <span className="font-extrabold text-slate-900 text-base sm:text-lg">
          {formatPrice(lineTotal)}
        </span>
      </div>

      {/* 4. Remove Button Column (col-span-1) */}
      <div className="col-span-1 w-full sm:w-auto flex justify-end">
        <button
          type="button"
          onClick={handleRemove}
          disabled={isBusy}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
          aria-label={`Remove ${product.name} from cart`}
          title="Remove item"
        >
          {localRemoving ? (
            <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default CartItem;
