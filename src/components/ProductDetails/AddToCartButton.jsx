import React, { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';

/**
 * AddToCartButton Component
 * Primary Action button for adding products to cart matching nexamart_app.tsx design.
 * UI is fully built now; cart state synchronization will be connected in Phase 6.
 *
 * @param {Object} props
 * @param {Object} props.product - Product object
 * @param {number} [props.quantity=1] - Quantity to add
 * @param {boolean} [props.disabled=false] - External disabled override
 * @param {boolean} [props.loading=false] - Loading spinner state
 * @param {Function} [props.onClick] - Click handler: (product, quantity) => void
 * @param {'sm'|'md'|'lg'} [props.size='lg'] - Button size
 * @param {boolean} [props.showIcon=true] - Display ShoppingCart icon
 * @param {string} [props.className='']
 */
const AddToCartButton = ({
  product,
  quantity = 1,
  disabled = false,
  loading = false,
  onClick,
  size = 'lg',
  showIcon = true,
  className = '',
}) => {
  const [isSuccess, setIsSuccess] = useState(false);

  const isOutOfStock = Boolean(product?.stock === 0) || disabled;

  const sizeClasses = {
    sm: 'h-10 px-4 text-xs font-semibold rounded-xl',
    md: 'h-12 px-6 text-sm font-bold rounded-xl',
    lg: 'h-14 px-8 text-base sm:text-lg font-bold rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.lg;
  const currentIconSize = iconSizes[size] || iconSizes.lg;

  const handleClick = (e) => {
    e.preventDefault();
    if (isOutOfStock || loading) return;

    if (onClick) {
      onClick(product, quantity);
    }

    // Temporary visual success feedback
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 2000);
  };

  if (isOutOfStock) {
    return (
      <button
        type="button"
        disabled
        className={`w-full bg-slate-200 text-slate-500 cursor-not-allowed flex items-center justify-center gap-2 transition-all ${currentSizeClass} ${className}`}
        aria-label="Product is currently out of stock"
      >
        <span>Out of Stock</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] select-none ${
        isSuccess
          ? 'bg-emerald-600 text-white shadow-emerald-500/20'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
      } ${currentSizeClass} ${className}`}
      aria-label={`Add ${quantity} ${product?.name || 'item'} to cart`}
    >
      {loading ? (
        <>
          <Loader2 className={`${currentIconSize} animate-spin`} />
          <span>Adding to Cart...</span>
        </>
      ) : isSuccess ? (
        <>
          <Check className={`${currentIconSize} animate-scale-up`} />
          <span>Added to Cart!</span>
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className={currentIconSize} />}
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
};

export default AddToCartButton;
