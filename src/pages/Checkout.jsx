import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, AlertCircle, CheckCircle } from 'lucide-react';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import useOrders from '../hooks/useOrders';
import CheckoutForm from '../components/Checkout/CheckoutForm';
import PaymentMethods from '../components/Checkout/PaymentMethods';
import OrderSummary from '../components/Checkout/OrderSummary';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';

/**
 * Checkout Page
 * Handles customer delivery address capture, payment selection (COD),
 * and atomic order submission via Cart UUID.
 * Strictly adheres to nexamart_app.tsx and API_DOCUMENTATION.md Section 2.7.
 */
const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartId, items, subtotal, loading: cartLoading, resetCart } = useCart();
  const { placeOrder, actionLoading, error: orderError } = useOrders({ autoFetch: false });

  // Form State initialized with logged-in user details if present
  const [formData, setFormData] = useState({
    name: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '',
    phone: user?.phone_number || '',
    address: user?.address || '',
    city: '',
    postalCode: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Sync user info if user loads asynchronously
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        phone: prev.phone || user.phone_number || '',
        address: prev.address || user.address || '',
      }));
    }
  }, [user]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific validation error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name?.trim()) {
      errs.name = 'Full name is required.';
    }
    if (!formData.phone?.trim()) {
      errs.phone = 'Contact phone number is required.';
    } else if (formData.phone.trim().length < 9) {
      errs.phone = 'Please enter a valid phone number.';
    }
    if (!formData.address?.trim()) {
      errs.address = 'Delivery address is required.';
    }
    if (!formData.city?.trim()) {
      errs.city = 'City or district is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    if (!cartId) {
      setSubmitError('Your shopping cart could not be located. Please try adding items again.');
      return;
    }

    setSubmitError(null);
    try {
      const createdOrder = await placeOrder(cartId);
      if (resetCart) {
        resetCart();
      }

      // On successful order placement, navigate to order history page with state
      navigate('/orders', {
        replace: true,
        state: {
          newOrderPlaced: true,
          orderId: createdOrder?.id,
        },
      });
    } catch (err) {
      console.error('Checkout failed:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.cart_id?.[0] ||
        'Failed to place order. Please review your cart and information.';
      setSubmitError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Loading state
  if (cartLoading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4">
        <LoadingSpinner size="lg" message="Preparing checkout..." />
      </div>
    );
  }

  // If cart is empty, show empty state prompt
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">
          You don&apos;t have any items ready for checkout. Please add products to your cart first.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Header & Back Link */}
      <div className="mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Cart</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Checkout
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Complete your delivery details to confirm your order.
        </p>
      </div>

      {/* Error Alert */}
      {(submitError || orderError) && (
        <div className="mb-6">
          <ErrorAlert
            message={submitError || orderError}
            variant="error"
          />
        </div>
      )}

      {/* 2-Column Responsive Checkout Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Delivery Form & Payment Option */}
        <div className="lg:w-7/12 w-full space-y-8">
          <CheckoutForm
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
            disabled={actionLoading}
          />

          <PaymentMethods
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
            disabled={actionLoading}
          />
        </div>

        {/* Right Column: Order Summary & Place Order Button */}
        <div className="lg:w-5/12 w-full">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shipping={15}
            onPlaceOrder={handlePlaceOrder}
            loading={actionLoading}
            disabled={actionLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
