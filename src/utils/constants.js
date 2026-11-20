/**
 * NexaMart Application Constants
 * Based on API_DOCUMENTATION.md and nexamart_app.tsx design system
 */

// Base API URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  CART_ID: 'cart_id',
  USER: 'nexamart_user',
};

// Auth Header Prefix (IMPORTANT: API requires 'JWT', NOT 'Bearer')
export const AUTH_HEADER_PREFIX = 'JWT';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication & Users
  AUTH: {
    REGISTER: '/auth/users/',
    LOGIN: '/auth/jwt/create/',
    REFRESH: '/auth/jwt/refresh/',
    VERIFY: '/auth/jwt/verify/',
    CURRENT_USER: '/auth/users/me/',
    SET_PASSWORD: '/auth/users/set_password/',
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories/',
    CREATE: '/categories/',
    DETAIL: (id) => `/categories/${id}/`,
    UPDATE: (id) => `/categories/${id}/`,
    DELETE: (id) => `/categories/${id}/`,
  },

  // Products
  PRODUCTS: {
    LIST: '/products/',
    CREATE: '/products/',
    DETAIL: (id) => `/products/${id}/`,
    UPDATE: (id) => `/products/${id}/`,
    DELETE: (id) => `/products/${id}/`,
    // Product Images (nested)
    IMAGES: (productId) => `/products/${productId}/images/`,
    IMAGE_DETAIL: (productId, id) => `/products/${productId}/images/${id}/`,
    // Product Reviews (nested)
    REVIEWS: (productId) => `/products/${productId}/reviews/`,
    REVIEW_DETAIL: (productId, id) => `/products/${productId}/reviews/${id}/`,
  },

  // Cart & Cart Items
  CARTS: {
    CREATE: '/carts/',
    DETAIL: (cartId) => `/carts/${cartId}/`,
    CLEAR: (cartId) => `/carts/${cartId}/`,
    ITEMS: (cartId) => `/carts/${cartId}/items/`,
    ITEM_DETAIL: (cartId, itemId) => `/carts/${cartId}/items/${itemId}/`,
  },

  // Orders
  ORDERS: {
    LIST: '/orders/',
    CREATE: '/orders/',
    DETAIL: (orderId) => `/orders/${orderId}/`,
    CANCEL: (orderId) => `/orders/${orderId}/cancel/`,
    UPDATE_STATUS: (orderId) => `/orders/${orderId}/update_status/`,
    DELETE: (orderId) => `/orders/${orderId}/`,
  },
};

// Order Status Constants
export const ORDER_STATUS = {
  NOT_PAID: 'Not Paid',
  READY_TO_SHIP: 'Ready To Ship',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELED: 'Canceled',
};

export const ORDER_STATUS_LIST = [
  ORDER_STATUS.NOT_PAID,
  ORDER_STATUS.READY_TO_SHIP,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELED,
];

// Order Status Visual Configuration (matches nexamart_app.tsx StatusBadge and tracker)
export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.NOT_PAID]: {
    label: 'Not Paid',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-400',
    dotClass: 'bg-amber-500',
    progressIndex: 0,
  },
  [ORDER_STATUS.READY_TO_SHIP]: {
    label: 'Ready To Ship',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-400',
    dotClass: 'bg-blue-500',
    progressIndex: 1,
  },
  [ORDER_STATUS.SHIPPED]: {
    label: 'Shipped',
    badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-400',
    dotClass: 'bg-cyan-500',
    progressIndex: 2,
  },
  [ORDER_STATUS.DELIVERED]: {
    label: 'Delivered',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-400',
    dotClass: 'bg-emerald-500',
    progressIndex: 3,
  },
  [ORDER_STATUS.CANCELED]: {
    label: 'Canceled',
    badgeClass: 'bg-red-100 text-red-700 border-red-400',
    dotClass: 'bg-red-600',
    progressIndex: -1,
  },
};

// Order Tracker Steps (sequential fulfillment progression)
export const ORDER_TRACKER_STEPS = [
  ORDER_STATUS.NOT_PAID,
  ORDER_STATUS.READY_TO_SHIP,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

// Sorting Options for Products Catalog
export const PRODUCT_SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: '-updated_at' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
];

// App Default Settings
export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  SHIPPING_FEE: 15.00,
  VAT_RATE: 0.10, // 10%
  MAX_IMAGE_SIZE_MB: 10,
};
