import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import StarRating from '../Common/StarRating';
import { formatPrice } from '../../utils/formatters';
import productService from '../../services/productService';

/**
 * ProductCard Component
 * Strictly replicates nexamart_app.tsx design with ৳ (Taka) currency formatting and DRF API integration.
 *
 * @param {Object} props
 * @param {Object} props.product - Product data object from Django API
 * @param {Function} [props.onAddToCart] - Cart addition callback
 */
const ProductCard = ({ product, onAddToCart }) => {
  if (!product) return null;

  const isOutOfStock = product.stock === 0;
  const productImage = productService.getProductImage(product);

  // Extract category display string safely
  const categoryLabel =
    typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : product.category_name || (typeof product.category === 'string' ? product.category : 'General');

  // Rating fallback if not computed on backend yet
  const ratingValue = product.rating !== undefined ? Number(product.rating) : 4.8;
  const reviewsCount = product.reviews !== undefined ? product.reviews : (product.reviews_count || 0);

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock && onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Product Image Area */}
      <Link
        to={`/products/${product.id}`}
        className="relative aspect-square overflow-hidden bg-slate-100 block cursor-pointer"
      >
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {categoryLabel && (
            <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
              {categoryLabel}
            </span>
          )}
          {product.sale && (
            <span className="bg-amber-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
              Sale
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-5 flex flex-col flex-1">
        {/* Star Rating */}
        <div className="mb-2">
          <StarRating
            rating={ratingValue}
            reviewsCount={reviewsCount}
            size="sm"
          />
        </div>

        {/* Product Title */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg text-slate-900 leading-tight mb-1 cursor-pointer hover:text-indigo-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
          {product.description || 'No description available for this product.'}
        </p>

        {/* Footer: Price (৳) and Add to Cart Button */}
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
          <div>
            <div className="text-xl font-bold text-slate-900">
              {formatPrice(product.price)}
            </div>
            {product.price_with_tax !== undefined && (
              <div className="text-xs text-slate-400 block mt-0.5">
                {formatPrice(product.price_with_tax)} incl. VAT
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCartClick}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white active:scale-95 shadow-xs'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
