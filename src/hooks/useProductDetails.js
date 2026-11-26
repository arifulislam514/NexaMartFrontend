import { useState, useEffect, useCallback, useMemo } from 'react';
import productService from '../services/productService';

/**
 * useProductDetails Hook
 * Fetches and manages single product details, image gallery, and customer reviews.
 * Strictly complies with API_DOCUMENTATION.md Section 2.3, 2.4, 2.5.
 *
 * @param {number|string} productId - Product ID from URL or parent
 * @param {Object} [options]
 * @param {boolean} [options.autoFetch=true]
 */
export const useProductDetails = (productId, { autoFetch = true } = {}) => {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(autoFetch && Boolean(productId));
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch product details and initial primary image
   */
  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProduct(productId);
      setProduct(data);

      // Determine initial active hero image
      const primaryImg = productService.getProductImage(data);
      setSelectedImage(primaryImg);

      return data;
    } catch (err) {
      console.error('Failed to load product details:', err);
      const message =
        err.response?.data?.detail || 'Product not found or failed to load.';
      setError(message);
      setProduct(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  /**
   * Fetch customer reviews for this product
   */
  const fetchReviews = useCallback(async () => {
    if (!productId) return [];

    setReviewsLoading(true);
    try {
      const data = await productService.getProductReviews(productId);
      const list = Array.isArray(data) ? data : data.results || [];
      setReviews(list);
      return list;
    } catch (err) {
      console.error('Failed to load product reviews:', err);
      return [];
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  // Initial load
  useEffect(() => {
    if (autoFetch && productId) {
      fetchProduct();
      fetchReviews();
    }
  }, [autoFetch, productId, fetchProduct, fetchReviews]);

  // Compute average rating and count
  const { averageRating, totalReviews } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      // Fallback to product.rating if provided by backend, else 0 default
      const defaultRating = product?.rating !== undefined ? Number(product.rating) : 0;
      const count = product?.reviews_count !== undefined ? Number(product.reviews_count) : (product?.reviews || 0);
      return { averageRating: defaultRating, totalReviews: count };
    }

    const sum = reviews.reduce((acc, curr) => acc + (Number(curr.ratings) || 0), 0);
    const avg = sum / reviews.length;
    return {
      averageRating: parseFloat(avg.toFixed(1)),
      totalReviews: reviews.length,
    };
  }, [reviews, product]);

  /**
   * Submit a new customer review (ratings 1 to 5)
   *
   * @param {Object} reviewData
   * @param {number} reviewData.ratings
   * @param {string} reviewData.comment
   */
  const submitReview = async ({ ratings, comment }) => {
    if (!productId) throw new Error('Product ID is missing');
    const created = await productService.createProductReview(productId, {
      ratings: Number(ratings),
      comment: comment.trim(),
    });
    // Refresh reviews list to show newly posted review
    await fetchReviews();
    return created;
  };

  /**
   * Update an existing review
   *
   * @param {number|string} reviewId
   * @param {Object} reviewData
   */
  const updateReview = async (reviewId, reviewData) => {
    const updated = await productService.updateProductReview(productId, reviewId, reviewData);
    await fetchReviews();
    return updated;
  };

  /**
   * Delete a review
   *
   * @param {number|string} reviewId
   */
  const deleteReview = async (reviewId) => {
    await productService.deleteProductReview(productId, reviewId);
    await fetchReviews();
  };

  return {
    product,
    selectedImage,
    setSelectedImage,
    reviews,
    reviewsLoading,
    totalReviews,
    averageRating,
    loading,
    error,
    refetchProduct: fetchProduct,
    refetchReviews: fetchReviews,
    submitReview,
    updateReview,
    deleteReview,
  };
};

export default useProductDetails;
