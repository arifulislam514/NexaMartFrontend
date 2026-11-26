import apiClient from './apiClient';

/**
 * Seller Service
 * Handles all multi-vendor marketplace APIs:
 * - Onboarding & Store Profile
 * - Seller Catalog Management (Products & Images)
 * - Seller Order Fulfillment & SubOrders
 * - Seller Earnings & Financial Summary
 * - Seller Coupon Management & Validation
 * - Public Storefront & Store Reviews
 */
export const sellerService = {
  // ==========================================
  // 1. ONBOARDING & STORE PROFILE
  // ==========================================

  /**
   * Apply to become a seller.
   * POST /api/v1/sellers/apply/
   * @param {FormData|Object} data - store_name, description, phone, logo
   */
  async applySeller(data) {
    const isFormData = data instanceof FormData;
    const response = await apiClient.post('/sellers/apply/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Get current authenticated user's seller profile.
   * GET /api/v1/seller/profile/
   */
  async getProfile() {
    const response = await apiClient.get('/seller/profile/');
    return response.data;
  },

  /**
   * Update current seller's store profile.
   * PATCH /api/v1/seller/profile/
   * @param {FormData|Object} data - store_name, description, phone, logo
   */
  async updateProfile(data) {
    const isFormData = data instanceof FormData;
    const response = await apiClient.patch('/seller/profile/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  // ==========================================
  // 2. SELLER CATALOG MANAGEMENT
  // ==========================================

  /**
   * List only the logged-in seller's products (paginated).
   * GET /api/v1/seller/products/
   */
  async getSellerProducts(params = {}) {
    const response = await apiClient.get('/seller/products/', { params });
    return response.data;
  },

  /**
   * Get details of seller's product.
   * GET /api/v1/seller/products/{id}/
   */
  async getSellerProduct(id) {
    const response = await apiClient.get(`/seller/products/${id}/`);
    return response.data;
  },

  /**
   * Add a new product (auto-assigns seller).
   * POST /api/v1/seller/products/
   */
  async createProduct(data) {
    const isFormData = data instanceof FormData;
    const response = await apiClient.post('/seller/products/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Update seller's product.
   * PATCH /api/v1/seller/products/{id}/
   */
  async updateProduct(id, data) {
    const isFormData = data instanceof FormData;
    const response = await apiClient.patch(`/seller/products/${id}/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Delete seller's product.
   * DELETE /api/v1/seller/products/{id}/
   */
  async deleteProduct(id) {
    const response = await apiClient.delete(`/seller/products/${id}/`);
    return response.data;
  },

  /**
   * List images for seller's product.
   * GET /api/v1/seller/products/{productId}/images/
   */
  async getProductImages(productId) {
    const response = await apiClient.get(`/seller/products/${productId}/images/`);
    return response.data;
  },

  /**
   * Upload image for seller's product.
   * POST /api/v1/seller/products/{productId}/images/
   */
  async uploadProductImage(productId, fileOrFormData) {
    let formData = fileOrFormData;
    if (!(fileOrFormData instanceof FormData)) {
      formData = new FormData();
      formData.append('image', fileOrFormData);
    }
    const response = await apiClient.post(
      `/seller/products/${productId}/images/`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  /**
   * Delete product image.
   * DELETE /api/v1/seller/products/{productId}/images/{id}/
   */
  async deleteProductImage(productId, imageId) {
    const response = await apiClient.delete(
      `/seller/products/${productId}/images/${imageId}/`
    );
    return response.data;
  },

  // ==========================================
  // 3. SELLER ORDER DASHBOARD & FULFILLMENT
  // ==========================================

  /**
   * List sub-orders containing this seller's products.
   * GET /api/v1/seller/orders/
   * Optional params: { status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'canceled' }
   */
  async getSellerOrders(params = {}) {
    const response = await apiClient.get('/seller/orders/', { params });
    return response.data;
  },

  /**
   * Get full sub-order detail (includes buyer address and phone).
   * GET /api/v1/seller/orders/{id}/
   */
  async getSellerOrder(id) {
    const response = await apiClient.get(`/seller/orders/${id}/`);
    return response.data;
  },

  /**
   * Update sub-order fulfillment status and tracking number.
   * PATCH /api/v1/seller/orders/{id}/status/
   * @param {string|number} id - SubOrder ID
   * @param {Object} data - { status: 'confirmed'|'shipped'|'delivered'|'canceled', tracking_number?: string }
   */
  async updateOrderStatus(id, data) {
    const response = await apiClient.patch(`/seller/orders/${id}/status/`, data);
    return response.data;
  },

  // ==========================================
  // 4. SELLER EARNINGS & FINANCIAL SUMMARY
  // ==========================================

  /**
   * Get financial overview (net earnings, pending payouts, commission paid).
   * GET /api/v1/seller/earnings/
   */
  async getEarnings() {
    const response = await apiClient.get('/seller/earnings/');
    return response.data;
  },

  // ==========================================
  // 5. SELLER COUPON MANAGEMENT & VALIDATION
  // ==========================================

  /**
   * List all coupons created for this seller's store.
   * GET /api/v1/seller/coupons/
   */
  async getCoupons(params = {}) {
    const response = await apiClient.get('/seller/coupons/', { params });
    return response.data;
  },

  /**
   * Create a new coupon code.
   * POST /api/v1/seller/coupons/
   * @param {Object} data - { code, discount_type, discount_value, min_purchase, valid_from, valid_to, active }
   */
  async createCoupon(data) {
    const response = await apiClient.post('/seller/coupons/', data);
    return response.data;
  },

  /**
   * Update coupon.
   * PATCH /api/v1/seller/coupons/{id}/
   */
  async updateCoupon(id, data) {
    const response = await apiClient.patch(`/seller/coupons/${id}/`, data);
    return response.data;
  },

  /**
   * Delete coupon.
   * DELETE /api/v1/seller/coupons/{id}/
   */
  async deleteCoupon(id) {
    const response = await apiClient.delete(`/seller/coupons/${id}/`);
    return response.data;
  },

  /**
   * Validate coupon and calculate discount.
   * POST /api/v1/coupons/validate/
   * @param {Object} data - { code: string, store_slug?: string, cart_amount: number }
   */
  async validateCoupon(data) {
    const response = await apiClient.post('/coupons/validate/', data);
    return response.data;
  },

  // ==========================================
  // 6. PUBLIC STOREFRONT & REVIEWS
  // ==========================================

  /**
   * List all approved marketplace stores.
   * GET /api/v1/stores/
   */
  async getStores(params = {}) {
    const response = await apiClient.get('/stores/', { params });
    return response.data;
  },

  /**
   * View public store profile, total products, average rating & review count.
   * GET /api/v1/stores/{slug}/
   */
  async getStore(slug) {
    const response = await apiClient.get(`/stores/${slug}/`);
    return response.data;
  },

  /**
   * Browse all active products by this specific seller.
   * GET /api/v1/stores/{slug}/products/
   */
  async getStoreProducts(slug, params = {}) {
    const response = await apiClient.get(`/stores/${slug}/products/`, { params });
    return response.data;
  },

  /**
   * List customer reviews for this store.
   * GET /api/v1/stores/{slug}/reviews/
   */
  async getStoreReviews(slug) {
    const response = await apiClient.get(`/stores/${slug}/reviews/`);
    return response.data;
  },

  /**
   * Submit review & rating (1 to 5) for store.
   * POST /api/v1/stores/{slug}/reviews/
   * @param {string} slug - Store slug
   * @param {Object} data - { rating: number, comment: string }
   */
  async createStoreReview(slug, data) {
    const response = await apiClient.post(`/stores/${slug}/reviews/`, data);
    return response.data;
  },
};

export default sellerService;
