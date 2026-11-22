import React from 'react';
import { MapPin, Phone, User, Home, FileText } from 'lucide-react';

/**
 * CheckoutForm Component
 * Collects shipping and delivery address details from customer.
 * Strictly adheres to nexamart_app.tsx styling.
 *
 * @param {Object} props
 * @param {Object} props.formData - Form fields { name, phone, address, city, postalCode, notes }
 * @param {Function} props.onChange - Handler (field, value) => void or (e) => void
 * @param {Object} [props.errors={}] - Form validation errors
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className='']
 */
const CheckoutForm = ({
  formData,
  onChange,
  errors = {},
  disabled = false,
  className = '',
}) => {
  const handleChange = (field) => (e) => {
    if (typeof onChange === 'function') {
      onChange(field, e.target.value);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 ${className}`}
    >
      <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Shipping Information
          </h3>
          <p className="text-xs text-slate-500">
            Enter your destination delivery address and contact information
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Full Name & Phone Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="checkout-name"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="checkout-name"
                type="text"
                value={formData.name || ''}
                onChange={handleChange('name')}
                disabled={disabled}
                placeholder="e.g. Rahim Uddin"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                  errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="checkout-phone"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="checkout-phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handleChange('phone')}
                disabled={disabled}
                placeholder="01XXXXXXXXX"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                  errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Full Delivery Address */}
        <div>
          <label
            htmlFor="checkout-address"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Street Address / Delivery Location <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute top-3.5 left-3.5 pointer-events-none text-slate-400">
              <Home className="w-4 h-4" />
            </div>
            <textarea
              id="checkout-address"
              rows={3}
              value={formData.address || ''}
              onChange={handleChange('address')}
              disabled={disabled}
              placeholder="House/Apartment #, Road #, Sector/Area details"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none ${
                errors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
              }`}
            />
          </div>
          {errors.address && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.address}</p>
          )}
        </div>

        {/* City & Postal Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="checkout-city"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              City / District <span className="text-rose-500">*</span>
            </label>
            <input
              id="checkout-city"
              type="text"
              value={formData.city || ''}
              onChange={handleChange('city')}
              disabled={disabled}
              placeholder="e.g. Dhaka, Chittagong, Sylhet"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                errors.city ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
              }`}
            />
            {errors.city && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.city}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="checkout-zip"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              ZIP / Postal Code
            </label>
            <input
              id="checkout-zip"
              type="text"
              value={formData.postalCode || ''}
              onChange={handleChange('postalCode')}
              disabled={disabled}
              placeholder="e.g. 1212"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        {/* Delivery Instructions / Order Notes (Optional) */}
        <div>
          <label
            htmlFor="checkout-notes"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Order Notes <span className="text-xs text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute top-3.5 left-3.5 pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              id="checkout-notes"
              rows={2}
              value={formData.notes || ''}
              onChange={handleChange('notes')}
              disabled={disabled}
              placeholder="Special instructions for delivery (e.g. deliver after 4 PM)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
