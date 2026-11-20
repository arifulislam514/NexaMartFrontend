import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';

/**
 * Footer Component
 * Matching nexamart_app.tsx design with modern responsive layout.
 */
const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
                <span className="text-white font-bold text-xl leading-none">N</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">NexaMart</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your one-stop destination for premium products. Quality meets affordability with seamless online shopping.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/products?category=Electronics"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=Fashion"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=Home & Kitchen"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=Sports"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Sports & Fitness
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-indigo-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-indigo-400 transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a href="#shipping" className="hover:text-indigo-400 transition-colors">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <Link to="/orders" className="hover:text-indigo-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Subscribe for the latest deals, updates, and seasonal discounts.
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-sm rounded-xl">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3.5 py-2.5 border border-slate-700 rounded-xl bg-slate-800/90 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors shadow-sm hover:shadow"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} NexaMart. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-slate-400">
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#cookies" className="hover:text-white transition-colors">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
