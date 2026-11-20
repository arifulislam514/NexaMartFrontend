import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section placeholder matching nexamart_app.tsx */}
      <section className="relative bg-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-indigo-600 opacity-90 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24 lg:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            Elevate Your Everyday <br className="hidden md:block" />
            <span className="text-amber-400">With Premium Gear</span>
          </h1>
          <p className="mt-4 text-xl text-indigo-100 max-w-2xl mb-10">
            Discover our curated collection of top-tier electronics, modern fashion, and essential home goods designed for the modern lifestyle.
          </p>
          <div className="flex gap-4">
            <Link
              to="/products"
              className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
