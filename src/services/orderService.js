import apiClient from './apiClient';
import { API_ENDPOINTS, ORDER_STATUS_CONFIG, ORDER_STATUS } from '../utils/constants';
import productService from './productService';

/**
 * Order Service
 * Handles order creation from UUID carts, order tracking, cancellation, and status updates
 * strictly complying with API_DOCUMENTATION.md Section 2.7.
 */
const orderService = {
  /**
   * List orders for current user (or all orders for Admin).
   * GET /api/v1/orders/
   *
   * @param {Object} [params]
   * @param {number} [params.page]
   * @param {string} [params.status]
   * @returns {Promise<Array<Object>|{ count: number, next: string|null, previous: string|null, results: Array<Object> }>}
   */
  async getOrders(params = {}) {
    const cleanParams = Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        acc[k] = v;
      }
      return acc;
    }, {});

    const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST, {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Retrieve details of a specific order by UUID.
   * GET /api/v1/orders/{order_id}/
   *
   * @param {string} orderId - Order UUID
   * @returns {Promise<Object>}
   */
  async getOrder(orderId) {
    if (!orderId) throw new Error('Order ID is required');
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.DETAIL(orderId));
    return response.data;
  },

  /**
   * Checkout / Place order from an existing cart.
   * POST /api/v1/orders/
   * Note: The backend atomically creates the order and snapshot, then deletes the cart.
   *
   * @param {string} cartId - Active cart UUID
   * @returns {Promise<Object>} Created order object
   */
  async createOrder(cartId) {
    if (!cartId) throw new Error('Cart ID is required to place an order');

    const payload = {
      cart_id: cartId,
    };

    const response = await apiClient.post(API_ENDPOINTS.ORDERS.CREATE, payload);
    return response.data;
  },

  /**
   * Cancel an order before it reaches 'Delivered' state.
   * POST /api/v1/orders/{order_id}/cancel/
   *
   * @param {string} orderId - Order UUID
   * @returns {Promise<Object>}
   */
  async cancelOrder(orderId) {
    if (!orderId) throw new Error('Order ID is required to cancel an order');
    const response = await apiClient.post(API_ENDPOINTS.ORDERS.CANCEL(orderId));
    return response.data;
  },

  /**
   * Update order status (Admin only).
   * PATCH /api/v1/orders/{order_id}/update_status/
   *
   * @param {string} orderId - Order UUID
   * @param {string} status - New order status ('Ready To Ship', 'Shipped', etc.)
   * @returns {Promise<Object>}
   */
  async updateOrderStatus(orderId, status) {
    if (!orderId) throw new Error('Order ID is required');
    if (!status) throw new Error('Status is required');

    const payload = { status };
    const response = await apiClient.patch(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
      payload
    );
    return response.data;
  },

  /**
   * Delete order (Admin only).
   * DELETE /api/v1/orders/{order_id}/
   *
   * @param {string} orderId - Order UUID
   * @returns {Promise<void>}
   */
  async deleteOrder(orderId) {
    if (!orderId) throw new Error('Order ID is required to delete an order');
    await apiClient.delete(API_ENDPOINTS.ORDERS.DELETE(orderId));
  },

  // ==========================================
  // HELPERS & NORMALIZATION
  // ==========================================

  /**
   * Normalize raw order data from DRF API into a safe and consistent shape for UI.
   *
   * @param {Object} rawOrder
   * @returns {Object}
   */
  formatOrder(rawOrder) {
    if (!rawOrder) return null;

    const items = Array.isArray(rawOrder.items)
      ? rawOrder.items.map((item) => {
          const product = item.product || {};
          return {
            id: item.id,
            price: Number(item.price || product.price || 0),
            quantity: Number(item.quantity || 1),
            total_price: Number(item.total_price || 0),
            product: {
              id: product.id,
              name: product.name || 'Product',
              price: Number(product.price || 0),
              image: productService.getProductImage(product),
              category: product.category,
            },
          };
        })
      : [];

    const status = rawOrder.status || ORDER_STATUS.NOT_PAID;
    const statusConfig = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG[ORDER_STATUS.NOT_PAID];

    const computedTotal = Number(
      rawOrder.total_price ??
      rawOrder.total ??
      items.reduce((sum, it) => sum + (it.total_price || (it.price * it.quantity)), 0)
    );

    return {
      id: rawOrder.id,
      user: rawOrder.user,
      status,
      statusConfig,
      total_price: computedTotal,
      total: computedTotal,
      created_at: rawOrder.created_at || rawOrder.date,
      items,
      itemCount: items.reduce((sum, it) => sum + it.quantity, 0),
    };
  },

  /**
   * Check if an order can be cancelled by the user.
   * Allowed before 'Delivered' and if not already 'Canceled'.
   *
   * @param {Object} order
   * @returns {boolean}
   */
  canCancel(order) {
    if (!order) return false;
    const status = order.status;
    return (
      status !== ORDER_STATUS.DELIVERED &&
      status !== ORDER_STATUS.CANCELED
    );
  },
};

export default orderService;
