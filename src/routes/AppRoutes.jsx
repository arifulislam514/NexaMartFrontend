import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import SellerDashboardLayout from '../layouts/SellerDashboardLayout';

// Route Protectors
import PrivateRoute from '../components/Common/PrivateRoute';
import AdminRoute from '../components/Common/AdminRoute';
import SellerRoute from '../components/Common/SellerRoute';

// Storefront Pages
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetail from '../pages/ProductDetail';
import About from '../pages/About';
import BecomeSeller from '../pages/BecomeSeller';
import StoreDetail from '../pages/StoreDetail';

// Customer Protected Pages
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import Profile from '../pages/Profile';

// Payment Status Pages
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFail from '../pages/PaymentFail';
import PaymentCancel from '../pages/PaymentCancel';

// Seller Protected Pages
import SellerDashboard from '../pages/seller/SellerDashboard';
import SellerProducts from '../pages/seller/SellerProducts';
import SellerOrders from '../pages/seller/SellerOrders';
import SellerCoupons from '../pages/seller/SellerCoupons';
import SellerSettings from '../pages/seller/SellerSettings';

// Admin Protected Pages
import Dashboard from '../pages/Dashboard';
import ManageProducts from '../components/Dashboard/Admin/ManageProducts';
import ManageCategories from '../components/Dashboard/Admin/ManageCategories';
import ManageOrders from '../components/Dashboard/Admin/ManageOrders';
import ManageReviews from '../components/Dashboard/Admin/ManageReviews';
import ManageUsers from '../components/Dashboard/Admin/ManageUsers';

// Auth Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import ActivateAccount from '../pages/ActivateAccount';

// 404 Page
import NotFound from '../pages/NotFound';

/**
 * AppRoutes
 * Comprehensive route configuration matching NexaMart multi-vendor structure.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Storefront Routes under MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Shop />} />
        <Route path="/shop" element={<Navigate to="/products" replace />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/become-seller" element={<BecomeSeller />} />
        <Route path="/stores/:slug" element={<StoreDetail />} />

        {/* Payment Callback Pages */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Customer Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 Route within storefront */}
        <Route path="/404" element={<NotFound />} />
      </Route>

      {/* Auth Routes under AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate/:uid/:token" element={<ActivateAccount />} />
        <Route path="/activate" element={<ActivateAccount />} />
      </Route>

      {/* Seller Protected Routes under SellerRoute */}
      <Route element={<SellerRoute />}>
        <Route element={<SellerDashboardLayout />}>
          <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/coupons" element={<SellerCoupons />} />
          <Route path="/seller/settings" element={<SellerSettings />} />
        </Route>
      </Route>

      {/* Admin Protected Routes under AdminRoute */}
      <Route element={<AdminRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<ManageProducts />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/orders" element={<ManageOrders />} />
          <Route path="/admin/reviews" element={<ManageReviews />} />
          <Route path="/admin/users" element={<ManageUsers />} />
        </Route>
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
