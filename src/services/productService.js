import apiClient from './apiClient';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Product & Category Service
 * Implements endpoints from API_DOCUMENTATION.md Section 2.2, 2.3, 2.4, 2.5
 */
const productService = {
  // ==========================================
  // 1. CATEGORIES ENDPOINTS (/api/v1/categories/)
  // ==========================================

  /**
   * List all categories (annotated with product_count)
   * GET /api/v1/categories/
   *
   * @returns {Promise<Array<{ id: number, name: string, description: string, product_count: number }>>}
   */
  async getCategories() {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
    return response.data;
  },

  /**
   * Get single category details
   * GET /api/v1/categories/{id}/
   *
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async getCategory(id) {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.DETAIL(id));
    return response.data;
  },

  /**
   * Create a new category (Admin only)
   * POST /api/v1/categories/
   *
   * @param {Object} categoryData
   * @param {string} categoryData.name
   * @param {string} [categoryData.description]
   * @returns {Promise<Object>}
   */
  async createCategory(categoryData) {
    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, categoryData);
    return response.data;
  },

  /**
   * Update category (Admin only)
   * PATCH /api/v1/categories/{id}/
   *
   * @param {number|string} id
   * @param {Object} categoryData
   * @returns {Promise<Object>}
   */
  async updateCategory(id, categoryData) {
    const response = await apiClient.patch(API_ENDPOINTS.CATEGORIES.UPDATE(id), categoryData);
    return response.data;
  },

  /**
   * Delete category (Admin only)
   * DELETE /api/v1/categories/{id}/
   *
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    const response = await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
    return response.data;
  },

  // ==========================================
  // 2. PRODUCTS ENDPOINTS (/api/v1/products/)
  // ==========================================

  /**
   * List products with pagination, search, category filter, price filters, ordering.
   * GET /api/v1/products/?page=1&search=...&ordering=-price&category_id=...&price__gt=...&price__lt=...
   *
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {string} [params.search]
   * @param {string} [params.ordering] - 'price', '-price', 'updated_at', '-updated_at'
   * @param {number|string} [params.category_id]
   * @param {number|string} [params.price__gt]
   * @param {number|string} [params.price__lt]
   * @returns {Promise<{ count: number, next: string|null, previous: string|null, results: Array }>}
   */
  async getProducts(params = {}) {
    // Strip null, undefined, or empty string values from query params
    const cleanParams = Object.entries(params).reduce((acc, [key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        acc[key] = val;
      }
      return acc;
    }, {});

    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, {
      params: cleanParams,
    });
    return response.data;
  },

  /**
   * Get single product details with images.
   * GET /api/v1/products/{id}/
   *
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async getProduct(id) {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return response.data;
  },

  /**
   * Create a new product (Admin only)
   * POST /api/v1/products/
   *
   * @param {Object} productData
   * @param {string} productData.name
   * @param {string} productData.description
   * @param {number} productData.price
   * @param {number} productData.stock
   * @param {number} productData.category - Category ID
   * @returns {Promise<Object>}
   */
  async createProduct(productData) {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, productData);
    return response.data;
  },

  /**
   * Update product details (Admin only)
   * PATCH /api/v1/products/{id}/
   *
   * @param {number|string} id
   * @param {Object} productData
   * @returns {Promise<Object>}
   */
  async updateProduct(id, productData) {
    const response = await apiClient.patch(API_ENDPOINTS.PRODUCTS.UPDATE(id), productData);
    return response.data;
  },

  /**
   * Delete product (Admin only)
   * DELETE /api/v1/products/{id}/
   *
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  async deleteProduct(id) {
    const response = await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
    return response.data;
  },

  // ==========================================
  // 3. PRODUCT IMAGES (Nested under /products/{id}/images/)
  // ==========================================

  /**
   * List all images for a product
   * GET /api/v1/products/{product_id}/images/
   *
   * @param {number|string} productId
   * @returns {Promise<Array<{ id: number, image: string }>>}
   */
  async getProductImages(productId) {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.IMAGES(productId));
    return response.data;
  },

  /**
   * Upload an image for a product (Multipart Form Data, Admin only, max 10MB)
   * POST /api/v1/products/{product_id}/images/
   *
   * @param {number|string} productId
   * @param {File|Blob} imageFile
   * @returns {Promise<{ id: number, image: string }>}
   */
  async uploadProductImage(productId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post(
      API_ENDPOINTS.PRODUCTS.IMAGES(productId),
      formData
    );
    return response.data;
  },

  /**
   * Delete a specific product image (Admin only)
   * DELETE /api/v1/products/{product_id}/images/{id}/
   *
   * @param {number|string} productId
   * @param {number|string} imageId
   * @returns {Promise<void>}
   */
  async deleteProductImage(productId, imageId) {
    const response = await apiClient.delete(
      API_ENDPOINTS.PRODUCTS.IMAGE_DETAIL(productId, imageId)
    );
    return response.data;
  },

  // ==========================================
  // 4. PRODUCT REVIEWS (Nested under /products/{id}/reviews/)
  // ==========================================

  /**
   * List all reviews for a product
   * GET /api/v1/products/{product_id}/reviews/
   *
   * @param {number|string} productId
   * @returns {Promise<Array>}
   */
  async getProductReviews(productId) {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.REVIEWS(productId));
    return response.data;
  },

  /**
   * Submit a review for a product (Authenticated user, ratings: 1 to 5)
   * POST /api/v1/products/{product_id}/reviews/
   *
   * @param {number|string} productId
   * @param {Object} reviewData
   * @param {number} reviewData.ratings - 1 to 5
   * @param {string} reviewData.comment
   * @returns {Promise<Object>}
   */
  async createProductReview(productId, reviewData) {
    const response = await apiClient.post(
      API_ENDPOINTS.PRODUCTS.REVIEWS(productId),
      reviewData
    );
    return response.data;
  },

  /**
   * Update own review (Author or Admin)
   * PATCH /api/v1/products/{product_id}/reviews/{id}/
   *
   * @param {number|string} productId
   * @param {number|string} reviewId
   * @param {Object} reviewData
   * @returns {Promise<Object>}
   */
  async updateProductReview(productId, reviewId, reviewData) {
    const response = await apiClient.patch(
      API_ENDPOINTS.PRODUCTS.REVIEW_DETAIL(productId, reviewId),
      reviewData
    );
    return response.data;
  },

  /**
   * Delete own review (Author or Admin)
   * DELETE /api/v1/products/{product_id}/reviews/{id}/
   *
   * @param {number|string} productId
   * @param {number|string} reviewId
   * @returns {Promise<void>}
   */
  async deleteProductReview(productId, reviewId) {
    const response = await apiClient.delete(
      API_ENDPOINTS.PRODUCTS.REVIEW_DETAIL(productId, reviewId)
    );
    return response.data;
  },

  // ==========================================
  // 5. HELPER NORMALIZERS
  // ==========================================

  /**
   * Extract primary image URL from product object with fallback
   *
   * @param {Object} product
   * @param {string} [fallback]
   * @returns {string}
   */
  getProductImage(product, fallback = 'https://placehold.co/600x600/4F46E5/ffffff?text=NexaMart') {
    if (!product) return fallback;
    if (product.images && product.images.length > 0 && product.images[0].image) {
      return product.images[0].image;
    }
    if (product.image) {
      return product.image;
    }
    return fallback;
  },
};

export default productService;
