import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import cartService from '../services/cartService';
import useAuth from '../hooks/useAuth';

/**
 * CartContext
 * Global cart state management using UUID-based backend carts and localStorage persistence.
 * Strictly complies with API_DOCUMENTATION.md Section 2.6 and nexamart_app.tsx design.
 */
export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [cart, setCart] = useState(null);
  const [cartId, setCartId] = useState(() => cartService.getStoredCartId());
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch or initialize cart from backend.
   * If stored cart returns 404 (e.g. backend deleted it on checkout), automatically creates a new cart.
   */
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setCartId(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const cartData = await cartService.getOrCreateCart();
      setCart(cartData);
      setCartId(cartData.id);
      return cartData;
    } catch (err) {
      console.error('Failed to load cart:', err);
      // Don't show network/auth errors if user is logging out
      if (err.response?.status !== 401) {
        setError(err.response?.data?.detail || 'Unable to synchronize shopping cart.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Synchronize cart when auth state changes
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
      setCartId(null);
      cartService.clearStoredCartId();
    }
  }, [isAuthenticated, authLoading, refreshCart]);

  /**
   * Add a product to the cart.
   *
   * @param {Object} product - Product object with at least id, price, name
   * @param {number} [quantity=1] - Quantity to add
   * @returns {Promise<{ success: boolean, requireAuth?: boolean, error?: string }>}
   */
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      return {
        success: false,
        requireAuth: true,
        error: 'Please sign in to add products to your cart.',
      };
    }

    if (!product?.id) {
      return { success: false, error: 'Invalid product selected.' };
    }

    setActionLoading(true);
    setError(null);
    try {
      // Ensure we have a valid cart ID
      let currentCartId = cartId;
      if (!currentCartId) {
        const newCart = await cartService.getOrCreateCart();
        currentCartId = newCart.id;
        setCartId(currentCartId);
      }

      await cartService.addItem(currentCartId, product.id, quantity);
      // Refresh cart to get accurate backend totals and snapshots
      const updatedCart = await cartService.getCart(currentCartId);
      setCart(updatedCart);

      return { success: true };
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.product_id?.[0] ||
        'Failed to add item to cart.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Update the quantity of a cart item.
   *
   * @param {number|string} itemId - Cart Item ID
   * @param {number} newQuantity - Desired quantity
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const updateQuantity = async (itemId, newQuantity) => {
    if (!cartId || !itemId) return { success: false };

    // If new quantity is 0 or less, remove item completely
    if (newQuantity <= 0) {
      return await removeFromCart(itemId);
    }

    setActionLoading(true);
    setError(null);
    try {
      await cartService.updateItemQuantity(cartId, itemId, newQuantity);
      const updatedCart = await cartService.getCart(cartId);
      setCart(updatedCart);
      return { success: true };
    } catch (err) {
      console.error('Failed to update cart item quantity:', err);
      const msg = err.response?.data?.detail || 'Failed to update item quantity.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Remove a single item from the cart.
   *
   * @param {number|string} itemId - Cart Item ID
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const removeFromCart = async (itemId) => {
    if (!cartId || !itemId) return { success: false };

    setActionLoading(true);
    setError(null);
    try {
      await cartService.removeItem(cartId, itemId);
      const updatedCart = await cartService.getCart(cartId);
      setCart(updatedCart);
      return { success: true };
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      const msg = err.response?.data?.detail || 'Failed to remove item.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Clear the entire cart (e.g. user manually empties cart or on order completion).
   *
   * @returns {Promise<void>}
   */
  const clearCart = async () => {
    setActionLoading(true);
    try {
      if (cartId) {
        await cartService.deleteCart(cartId);
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
    } finally {
      setCart(null);
      setCartId(null);
      cartService.clearStoredCartId();
      setActionLoading(false);
    }
  };

  // Normalized list of cart items
  const items = useMemo(() => {
    if (!cart?.items || !Array.isArray(cart.items)) return [];
    return cart.items.map(cartService.formatCartItem);
  }, [cart]);

  // Derived computations
  const { itemCount, subtotal, total } = useMemo(() => {
    const count = items.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
    const sub = cart?.total_price !== undefined ? Number(cart.total_price) : cartService.calculateSubtotal(items);
    return {
      itemCount: count,
      subtotal: sub,
      total: sub,
    };
  }, [items, cart]);

  const value = {
    cart,
    cartId,
    items,
    itemCount,
    subtotal,
    total,
    loading,
    actionLoading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
