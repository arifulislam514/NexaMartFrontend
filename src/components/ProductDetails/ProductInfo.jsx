import React, { useState } from 'react';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import StarRating from '../Common/StarRating';
import AddToCartButton from './AddToCartButton';
import { formatPrice } from '../../utils/formatters';

/**
 * ProductInfo Component
 * Displays product metadata, pricing (৳), stock status, quantity picker, and add-to-cart action.
 * Strictly adheres to nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {Object} props.product - Product data object from Django API
 * @param {number} [props.averageRating] - Average star rating
 * @param {number} [props.totalReviews] - Total reviews count
 * @param {Function} [props.onAddToCart] - Callback when Add to Cart is clicked: (product, quantity) => void
 * @param {string} [props.className='']
 */
const ProductInfo = ({
  product,
  averageRating = 5,
  totalReviews = 0,
  onAddToCart,
  className = '',
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock === 0;

  // Resolve category name
  const categoryLabel =
    typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : product.category_name || (typeof product.category === 'string' ? product.category : 'General');

  const handleDecreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQty = () => {
    if (product.stock > 0) {
      setQuantity((prev) => Math.min(product.stock, prev + 1));
    }
  };

  const handleAddToCart = () => {
    if (!isOutOfStock && onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Category Pill & Stock Status Badge */}
      <div className="mb-3 flex items-center justify-between">
        {categoryLabel && (
          <span className="text-xs sm:text-sm font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-3.5 py-1.5 rounded-full shadow-2xs">
            {categoryLabel}
          </span>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span
            className={`flex items-center gap-1.5 ${
              isOutOfStock ? 'text-red-700' : 'text-emerald-700'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isOutOfStock ? 'bg-red-600' : 'bg-emerald-600'
              }`}
            ></div>
            {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock})`}
          </span>
        </div>
      </div>

      {/* Product Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
        {product.name}
      </h1>

      {/* Star Rating & Reviews Count */}
      <div className="flex items-center gap-3 mb-6">
        <StarRating
          rating={averageRating}
          reviewsCount={totalReviews}
          size="md"
        />
        <span className="text-xs text-slate-400 font-medium border-l border-slate-200 pl-3">
          Verified Quality
        </span>
      </div>

      {/* Pricing Card with ৳ (Taka) */}
      <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {formatPrice(product.price)}
          </span>
        </div>
        {product.price_with_tax !== undefined && (
          <p className="text-sm text-slate-500 font-medium">
            {formatPrice(product.price_with_tax)} inclusive of VAT
          </p>
        )}
      </div>

      {/* Description */}
      <div className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
          Overview
        </h3>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          {product.description || 'Premium quality product designed for modern everyday needs.'}
        </p>
      </div>

      {/* Actions: Quantity Selector & Add to Cart */}
      <div className="mt-auto pt-6 border-t border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <span className="font-semibold text-sm text-slate-900">Quantity</span>
          <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden h-11 w-32 shadow-2xs">
            <button
              type="button"
              onClick={handleDecreaseQty}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-10 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-base"
              aria-label="Decrease quantity"
            >
              &minus;
            </button>
            <div className="flex-1 text-center font-bold text-slate-900 text-sm">
              {quantity}
            </div>
            <button
              type="button"
              onClick={handleIncreaseQty}
              disabled={quantity >= product.stock || isOutOfStock}
              className="w-10 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-base"
              aria-label="Increase quantity"
            >
              &#43;
            </button>
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-xs font-semibold text-amber-600">
              Only {product.stock} left in stock!
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <AddToCartButton
            product={product}
            quantity={quantity}
            onClick={handleAddToCart}
            className="flex-1"
          />
        </div>

        {/* Product Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-slate-500 text-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>Fast Home Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-indigo-600" />
            <span>30-Day Easy Returns</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
