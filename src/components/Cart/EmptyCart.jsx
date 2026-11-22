import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';

/**
 * EmptyCart Component
 * Friendly empty state displayed when the shopping cart has no items.
 * Strictly adheres to nexamart_app.tsx styling.
 *
 * @param {Object} props
 * @param {string} [props.title='Your cart is empty']
 * @param {string} [props.message]
 * @param {string} [props.actionLink='/products']
 * @param {string} [props.actionText='Continue Shopping']
 * @param {string} [props.className='']
 */
const EmptyCart = ({
  title = 'Your cart is empty',
  message = "Looks like you haven't added anything to your cart yet. Discover our latest products and deals!",
  actionLink = '/products',
  actionText = 'Continue Shopping',
  className = '',
}) => {
  return (
    <div
      className={`max-w-7xl mx-auto px-4 py-16 sm:py-24 text-center animate-fade-in ${className}`}
    >
      {/* Icon Graphic */}
      <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 border border-slate-200/60 shadow-2xs">
        <ShoppingCart className="w-14 h-14 sm:w-16 sm:h-16 stroke-[1.5]" />
      </div>

      {/* Main Copy */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
        {title}
      </h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
        {message}
      </p>

      {/* CTA Button */}
      <Link
        to={actionLink}
        className="inline-flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-bold text-base sm:text-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
      >
        <span>{actionText}</span>
        <ArrowRight className="w-5 h-5" />
      </Link>

      {/* Suggested Quick Links */}
      <div className="mt-12 pt-8 border-t border-slate-200 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Popular Categories</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/products?category=Electronics"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-full transition-colors shadow-2xs"
          >
            Electronics
          </Link>
          <Link
            to="/products?category=Fashion"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-full transition-colors shadow-2xs"
          >
            Fashion
          </Link>
          <Link
            to="/products?category=Home"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-full transition-colors shadow-2xs"
          >
            Home & Living
          </Link>
          <Link
            to="/products"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-full transition-colors shadow-2xs"
          >
            All Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;
