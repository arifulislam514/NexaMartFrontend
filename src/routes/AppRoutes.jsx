import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Route Protectors
import PrivateRoute from '../components/Common/PrivateRoute';
import AdminRoute from '../components/Common/AdminRoute';

// Storefront Pages
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetail from '../pages/ProductDetail';
import About from '../pages/About';

// Customer Protected Pages
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import Profile from '../pages/Profile';

// Admin Protected Pages
import Dashboard from '../pages/Dashboard';

// Auth Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import ActivateAccount from '../pages/ActivateAccount';

// 404 Page
import NotFound from '../pages/NotFound';

/**
 * AppRoutes
 * Comprehensive route configuration matching nexamart_app.tsx structure.
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

      {/* Admin Protected Routes under AdminRoute */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
