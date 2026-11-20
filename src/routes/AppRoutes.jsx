import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ActivateAccount from '../pages/ActivateAccount';

/**
 * AppRoutes configuration
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes wrapped with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate/:uid/:token" element={<ActivateAccount />} />
        <Route path="/activate" element={<ActivateAccount />} />
      </Route>

      {/* Default fallback redirects to /login for now */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
