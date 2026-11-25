import { useState, useEffect, useCallback, useMemo } from 'react';
import productService from '../services/productService';

/**
 * useReviews Hook
 * Manages fetching, submitting, editing, and deleting customer product reviews
 * strictly complying with API_DOCUMENTATION.md Section 2.5.
 *
 * @param {number|string} productId - Product ID
 * @param {Object} [options]
 * @param {boolean} [options.autoFetch=true] - Whether to load reviews automatically
 */
export const useReviews = (productId, { autoFetch = true } = {}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(autoFetch && Boolean(productId));
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all reviews for the current product
   */
  const fetchReviews = useCallback(async () => {
    if (!productId) {
      setReviews([]);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProductReviews(productId);
      const list = Array.isArray(data) ? data : data?.results || [];
      setReviews(list);
      return list;
    } catch (err) {
      console.error('Failed to load product reviews:', err);
      const msg = err.response?.data?.detail || 'Failed to load reviews.';
      setError(msg);
      setReviews([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Initial load
  useEffect(() => {
    if (autoFetch && productId) {
      fetchReviews();
    }
  }, [autoFetch, productId, fetchReviews]);

  /**
   * Compute average rating, total count, and 1-5 star distribution
   */
  const { averageRating, totalReviews, ratingDistribution } = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!reviews || reviews.length === 0) {
      return {
        averageRating: 5.0,
        totalReviews: 0,
        ratingDistribution: counts,
      };
    }

    let sum = 0;
    reviews.forEach((r) => {
      const ratingNum = Math.min(
        5,
        Math.max(1, Math.round(Number(r.ratings || r.rating || 5)))
      );
      sum += ratingNum;
      counts[ratingNum] = (counts[ratingNum] || 0) + 1;
    });

    const avg = parseFloat((sum / reviews.length).toFixed(1));

    return {
      averageRating: avg,
      totalReviews: reviews.length,
      ratingDistribution: counts,
    };
  }, [reviews]);

  /**
   * Submit a new customer review (ratings: 1 to 5, comment)
   *
   * @param {Object} reviewData
   * @param {number} reviewData.ratings
   * @param {string} reviewData.comment
   * @returns {Promise<Object>} Created review
   */
  const submitReview = async ({ ratings, comment }) => {
    if (!productId) throw new Error('Product ID is required');

    setActionLoading(true);
    setError(null);
    try {
      const created = await productService.createProductReview(productId, {
        ratings: Number(ratings),
        comment: String(comment || '').trim(),
      });
      await fetchReviews();
      return created;
    } catch (err) {
      console.error('Failed to submit review:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.ratings?.[0] ||
        err.response?.data?.comment?.[0] ||
        'Failed to submit review.';
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Update an existing review (Author or Admin)
   *
   * @param {number|string} reviewId - Review ID
   * @param {Object} reviewData
   * @param {number} [reviewData.ratings]
   * @param {string} [reviewData.comment]
   * @returns {Promise<Object>} Updated review
   */
  const updateReview = async (reviewId, reviewData) => {
    if (!productId || !reviewId) throw new Error('Product ID and Review ID are required');

    setActionLoading(true);
    setError(null);
    try {
      const payload = {};
      if (reviewData.ratings !== undefined) {
        payload.ratings = Number(reviewData.ratings);
      }
      if (reviewData.comment !== undefined) {
        payload.comment = String(reviewData.comment).trim();
      }

      const updated = await productService.updateProductReview(
        productId,
        reviewId,
        payload
      );
      await fetchReviews();
      return updated;
    } catch (err) {
      console.error('Failed to update review:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.ratings?.[0] ||
        err.response?.data?.comment?.[0] ||
        'Failed to update review.';
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Delete an existing review (Author or Admin)
   *
   * @param {number|string} reviewId - Review ID
   * @returns {Promise<void>}
   */
  const deleteReview = async (reviewId) => {
    if (!productId || !reviewId) throw new Error('Product ID and Review ID are required');

    setActionLoading(true);
    setError(null);
    try {
      await productService.deleteProductReview(productId, reviewId);
      await fetchReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
      const msg = err.response?.data?.detail || 'Failed to delete review.';
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    reviews,
    totalReviews,
    averageRating,
    ratingDistribution,
    loading,
    actionLoading,
    error,
    fetchReviews,
    submitReview,
    updateReview,
    deleteReview,
  };
};

export default useReviews;
