import { useState, useEffect, useCallback, useRef } from 'react';
import orderService from '../services/orderService';
import cartService from '../services/cartService';

/**
 * useOrders Hook
 * Custom hook to manage customer and admin orders, checkout creation, tracking, and cancellation.
 * Strictly complies with API_DOCUMENTATION.md Section 2.7.
 *
 * @param {Object} [options]
 * @param {boolean} [options.autoFetch=true] - Whether to load orders automatically on mount
 * @param {Object} [options.initialParams={}] - Optional filters/pagination parameters
 */
export const useOrders = ({ autoFetch = true, initialParams = {} } = {}) => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(autoFetch);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep a ref of initialParams to avoid recreating fetchOrders callback on every render
  const initialParamsRef = useRef(initialParams);
  const serializedInitialParams = JSON.stringify(initialParams || {});

  useEffect(() => {
    initialParamsRef.current = initialParams;
  }, [serializedInitialParams]);

  /**
   * Fetch all orders for the current user (or all if admin).
   * Stable callback: does not re-create on every render.
   */
  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const mergedParams = { ...(initialParamsRef.current || {}), ...params };
      const data = await orderService.getOrders(mergedParams);

      if (Array.isArray(data)) {
        const formatted = data.map(orderService.formatOrder);
        setOrders(formatted);
        setPagination({ count: formatted.length, next: null, previous: null });
        return formatted;
      } else if (data && Array.isArray(data.results)) {
        const formatted = data.results.map(orderService.formatOrder);
        setOrders(formatted);
        setPagination({
          count: data.count || formatted.length,
          next: data.next,
          previous: data.previous,
        });
        return formatted;
      } else {
        setOrders([]);
        return [];
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      const msg = err.response?.data?.detail || 'Failed to load order history.';
      setError(msg);
      setOrders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch single order detail by UUID
   */
  const fetchOrder = useCallback(async (orderId) => {
    if (!orderId) return null;
    setActionLoading(true);
    try {
      const data = await orderService.getOrder(orderId);
      return orderService.formatOrder(data);
    } catch (err) {
      console.error('Failed to fetch order detail:', err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  /**
   * Place an order from active cart (Checkout)
   *
   * @param {string} cartId - Cart UUID
   * @returns {Promise<Object>} Created order object
   */
  const placeOrder = async (cartId) => {
    if (!cartId) throw new Error('Cart ID is required to place an order');

    setActionLoading(true);
    setError(null);
    try {
      const rawOrder = await orderService.createOrder(cartId);
      const formatted = orderService.formatOrder(rawOrder);

      // Clean local cart state since backend deleted the cart
      try {
        cartService.clearStoredCartId();
      } catch (err) {
        console.warn('Failed to clear cart ID after order placement:', err);
      }

      // Refresh orders list
      await fetchOrders();

      return formatted;
    } catch (err) {
      console.error('Failed to create order from cart:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.cart_id?.[0] ||
        'Could not complete checkout. Please review your cart and try again.';
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Cancel an order before it is delivered
   *
   * @param {string} orderId - Order UUID
   */
  const cancelOrder = async (orderId) => {
    if (!orderId) throw new Error('Order ID is required to cancel');

    setActionLoading(true);
    setError(null);
    try {
      const result = await orderService.cancelOrder(orderId);
      await fetchOrders();
      return result;
    } catch (err) {
      console.error('Failed to cancel order:', err);
      const msg = err.response?.data?.detail || 'Unable to cancel order.';
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Update order status (Admin only)
   *
   * @param {string} orderId - Order UUID
   * @param {string} status - New status
   */
  const updateStatus = async (orderId, status) => {
    if (!orderId || !status) throw new Error('Order ID and status are required');

    setActionLoading(true);
    setError(null);
    try {
      const result = await orderService.updateOrderStatus(orderId, status);
      await fetchOrders();
      return result;
    } catch (err) {
      console.error('Failed to update order status:', err);
      const msg = err.response?.data?.detail || 'Failed to update order status.';
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Delete an order (Admin only)
   *
   * @param {string} orderId - Order UUID
   */
  const deleteOrder = async (orderId) => {
    if (!orderId) throw new Error('Order ID is required');

    setActionLoading(true);
    setError(null);
    try {
      await orderService.deleteOrder(orderId);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to delete order:', err);
      const msg = err.response?.data?.detail || 'Failed to delete order.';
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Initial load: Only fires when autoFetch changes or serialized initialParams changes
  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch, fetchOrders, serializedInitialParams]);

  return {
    orders,
    pagination,
    loading,
    actionLoading,
    error,
    fetchOrders,
    refetchOrders: fetchOrders,
    fetchOrder,
    placeOrder,
    cancelOrder,
    updateStatus,
    deleteOrder,
  };
};

export default useOrders;
