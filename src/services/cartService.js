import apiClient from './apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

/**
 * Cart Service
 * Manages UUID-based shopping carts and nested cart items strictly complying with
 * API_DOCUMENTATION.md Section 2.6 and nexamart_app.tsx architecture.
 *
 * All cart endpoints require JWT authentication.
 */
const cartService = {
  // ==========================================
  // 1. LOCAL STORAGE HELPERS
  // ==========================================

  /**
   * Retrieve the persisted cart UUID from localStorage.
   * @returns {string|null}
   */
  getStoredCartId() {
    try {
      return localStorage.getItem(STORAGE_KEYS.CART_ID);
    } catch {
      return null;
    }
  },

  /**
   * Persist cart UUID in localStorage.
   * @param {string} cartId - Cart UUID
   */
  setStoredCartId(cartId) {
    try {
      if (cartId) {
        localStorage.setItem(STORAGE_KEYS.CART_ID, cartId);
      }
    } catch (e) {
      console.warn('Failed to store cart_id in localStorage:', e);
    }
  },

  /**
   * Remove cart UUID from localStorage (e.g. after checkout or manual clear).
   */
  clearStoredCartId() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CART_ID);
    } catch (e) {
      console.warn('Failed to remove cart_id from localStorage:', e);
    }
  },

  // ==========================================
  // 2. CART LIFECYCLE (POST, GET, DELETE /carts/)
  // ==========================================

  /**
   * Initialize a new cart for the authenticated user.
   * POST /api/v1/carts/
   *
   * @returns {Promise<{ id: string, user: number, items: Array, total_price: number }>}
   */
  async createCart() {
    const response = await apiClient.post(API_ENDPOINTS.CARTS.CREATE);
    const cart = response.data;
    if (cart?.id) {
      this.setStoredCartId(cart.id);
    }
    return cart;
  },

  /**
   * Retrieve cart details by UUID with all items and total price.
   * GET /api/v1/carts/{cart_id}/
   *
   * @param {string} cartId - Cart UUID
   * @returns {Promise<{ id: string, user: number, items: Array, total_price: number }>}
   */
  async getCart(cartId) {
    if (!cartId) {
      throw new Error('Cart ID is required to fetch cart details');
    }
    const response = await apiClient.get(API_ENDPOINTS.CARTS.DETAIL(cartId));
    return response.data;
  },

  /**
   * Retrieve existing cart from localStorage or create a fresh one if missing or 404 expired.
   * Note: The backend automatically deletes the cart upon checkout, returning 404 subsequently.
   *
   * @returns {Promise<{ id: string, user: number, items: Array, total_price: number }>}
   */
  async getOrCreateCart() {
    const storedCartId = this.getStoredCartId();

    if (storedCartId) {
      try {
        const cart = await this.getCart(storedCartId);
        return cart;
      } catch (err) {
        // If 404 (cart was deleted by checkout or expired), create a fresh cart
        if (err.response?.status === 404) {
          console.info('Stored cart expired or was converted to an order. Creating a new cart.');
          this.clearStoredCartId();
        } else {
          // Re-throw non-404 errors (e.g. network or 401 unauthenticated)
          throw err;
        }
      }
    }

    // Initialize brand new cart
    return await this.createCart();
  },

  /**
   * Delete / clear an entire cart.
   * DELETE /api/v1/carts/{cart_id}/
   *
   * @param {string} [cartId] - Optional cart UUID; defaults to stored cart ID
   * @returns {Promise<void>}
   */
  async deleteCart(cartId) {
    const targetCartId = cartId || this.getStoredCartId();
    if (!targetCartId) return;

    try {
      await apiClient.delete(API_ENDPOINTS.CARTS.CLEAR(targetCartId));
    } finally {
      this.clearStoredCartId();
    }
  },

  // ==========================================
  // 3. CART ITEMS CRUD (/carts/{cart_id}/items/)
  // ==========================================

  /**
   * List all items in the specified cart.
   * GET /api/v1/carts/{cart_id}/items/
   *
   * @param {string} cartId - Cart UUID
   * @returns {Promise<Array<{ id: number, product: Object, quantity: number, total_price: number }>>}
   */
  async getCartItems(cartId) {
    if (!cartId) throw new Error('Cart ID is required to fetch cart items');
    const response = await apiClient.get(API_ENDPOINTS.CARTS.ITEMS(cartId));
    return response.data;
  },

  /**
   * Add a product to the cart.
   * POST /api/v1/carts/{cart_id}/items/
   *
   * @param {string} cartId - Cart UUID
   * @param {number|string} productId - Product ID
   * @param {number} [quantity=1] - Quantity to add
   * @returns {Promise<Object>} Added/Updated cart item
   */
  async addItem(cartId, productId, quantity = 1) {
    if (!cartId) throw new Error('Cart ID is required to add an item');
    if (!productId) throw new Error('Product ID is required');

    const payload = {
      product_id: Number(productId),
      quantity: Math.max(1, Number(quantity)),
    };

    const response = await apiClient.post(API_ENDPOINTS.CARTS.ITEMS(cartId), payload);
    return response.data;
  },

  /**
   * Update the quantity of an item in the cart.
   * PATCH /api/v1/carts/{cart_id}/items/{item_id}/
   *
   * @param {string} cartId - Cart UUID
   * @param {number|string} itemId - Cart Item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart item
   */
  async updateItemQuantity(cartId, itemId, quantity) {
    if (!cartId) throw new Error('Cart ID is required');
    if (!itemId) throw new Error('Item ID is required');

    const payload = {
      quantity: Math.max(1, Number(quantity)),
    };

    const response = await apiClient.patch(
      API_ENDPOINTS.CARTS.ITEM_DETAIL(cartId, itemId),
      payload
    );
    return response.data;
  },

  /**
   * Remove a single item from the cart.
   * DELETE /api/v1/carts/{cart_id}/items/{item_id}/
   *
   * @param {string} cartId - Cart UUID
   * @param {number|string} itemId - Cart Item ID
   * @returns {Promise<void>}
   */
  async removeItem(cartId, itemId) {
    if (!cartId) throw new Error('Cart ID is required');
    if (!itemId) throw new Error('Item ID is required');

    await apiClient.delete(API_ENDPOINTS.CARTS.ITEM_DETAIL(cartId, itemId));
  },

  // ==========================================
  // 4. COMPUTATION & NORMALIZATION HELPERS
  // ==========================================

  /**
   * Calculate total quantity of items in a cart.
   *
   * @param {Object|Array} cartOrItems - Cart object with .items or array of items
   * @returns {number}
   */
  calculateItemCount(cartOrItems) {
    const items = Array.isArray(cartOrItems)
      ? cartOrItems
      : cartOrItems?.items || [];

    return items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
  },

  /**
   * Calculate subtotal price for items in a cart.
   *
   * @param {Object|Array} cartOrItems - Cart object or array of items
   * @returns {number}
   */
  calculateSubtotal(cartOrItems) {
    if (cartOrItems && typeof cartOrItems.total_price === 'number') {
      return cartOrItems.total_price;
    }

    const items = Array.isArray(cartOrItems)
      ? cartOrItems
      : cartOrItems?.items || [];

    const total = items.reduce((sum, item) => {
      if (item?.total_price !== undefined) {
        return sum + Number(item.total_price);
      }
      const unitPrice = Number(item?.product?.price) || 0;
      const qty = Number(item?.quantity) || 1;
      return sum + unitPrice * qty;
    }, 0);

    return parseFloat(total.toFixed(2));
  },

  /**
   * Formats and normalizes a cart item for safe and consistent rendering in UI components.
   *
   * @param {Object} item - Raw cart item from Django API
   * @returns {Object} Normalized cart item
   */
  formatCartItem(item) {
    if (!item) return null;

    const product = item.product || {};
    const unitPrice = Number(product.price || 0);
    const quantity = Number(item.quantity || 1);
    const totalPrice = item.total_price !== undefined ? Number(item.total_price) : unitPrice * quantity;

    return {
      id: item.id,
      quantity,
      total_price: totalPrice,
      product: {
        id: product.id,
        name: product.name || 'Unnamed Product',
        price: unitPrice,
        price_with_tax: product.price_with_tax || unitPrice,
        stock: product.stock !== undefined ? product.stock : 99,
        image: product.image || (Array.isArray(product.images) && product.images[0]?.image) || null,
        category: product.category,
      },
    };
  },
};

export default cartService;
