import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';

/**
 * AddToCartButton Component
 * Primary Action button for adding products to cart matching nexamart_app.tsx design.
 * Directly connected to CartContext with auth check, loading feedback, and live badge sync.
 *
 * @param {Object} props
 * @param {Object} props.product - Product object
 * @param {number} [props.quantity=1] - Quantity to add
 * @param {boolean} [props.disabled=false] - External disabled override
 * @param {boolean} [props.loading=false] - External loading spinner override
 * @param {Function} [props.onClick] - Optional custom click handler: (product, quantity) => Promise<void>|void
 * @param {'sm'|'md'|'lg'} [props.size='lg'] - Button size
 * @param {boolean} [props.showIcon=true] - Display ShoppingCart icon
 * @param {string} [props.className='']
 */
const AddToCartButton = ({
  product,
  quantity = 1,
  disabled = false,
  loading: externalLoading = false,
  onClick,
  size = 'lg',
  showIcon = true,
  className = '',
}) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSuccess, setIsSuccess] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const isOutOfStock = Boolean(product?.stock === 0) || disabled;
  const isLoading = externalLoading || internalLoading;

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

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isLoading) return;

    // If custom handler was passed by parent, call it
    if (onClick) {
      try {
        setInternalLoading(true);
        await onClick(product, quantity);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
      } catch (err) {
        console.error('Custom onAddToCart handler failed:', err);
      } finally {
        setInternalLoading(false);
      }
      return;
    }

    // Default built-in cart context handling
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    setInternalLoading(true);
    try {
      const result = await addToCart(product, quantity);
      if (result?.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 2000);
      } else if (result?.requireAuth) {
        navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      }
    } catch (err) {
      console.error('Failed to add product to cart:', err);
    } finally {
      setInternalLoading(false);
    }
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
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] select-none ${
        isSuccess
          ? 'bg-emerald-600 text-white shadow-emerald-500/20'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
      } ${currentSizeClass} ${className}`}
      aria-label={`Add ${quantity} ${product?.name || 'item'} to cart`}
    >
      {isLoading ? (
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
