import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Search, HelpCircle, ArrowLeft } from 'lucide-react';

/**
 * NotFound Page Component
 * 404 Error Screen with search and helpful quick navigation links.
 */
const NotFound = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      {/* 404 Visual Icon Badge */}
      <div className="relative mb-6">
        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto shadow-md shadow-indigo-500/10 animate-fade-in-up">
          <span className="text-5xl sm:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-violet-600">
            404
          </span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center font-bold shadow-md">
          <HelpCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Main Headings */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
        We couldn't find the page or product you're looking for. It may have been moved, renamed, or temporarily unavailable.
      </p>

      {/* Search Bar on 404 */}
      <div className="w-full max-w-md mb-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-24 py-3 border border-slate-300 rounded-2xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-xs transition-all"
            placeholder="Search our catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute inset-y-1.5 right-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center shadow-xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* Navigation Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-none justify-center">
        <Link
          to="/"
          className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>

        <Link
          to="/products"
          className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:text-indigo-600 shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shop Products</span>
        </Link>
      </div>

      {/* Helpful Links */}
      <div className="mt-12 pt-8 border-t border-slate-200 w-full max-w-md flex justify-center gap-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Link to="/products?category=Electronics" className="hover:text-indigo-600 transition-colors">
          Electronics
        </Link>
        <span>&bull;</span>
        <Link to="/products?category=Fashion" className="hover:text-indigo-600 transition-colors">
          Fashion
        </Link>
        <span>&bull;</span>
        <Link to="/orders" className="hover:text-indigo-600 transition-colors">
          Track Orders
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
