import { useState, useEffect, useCallback } from 'react';
import productService from '../services/productService';

/**
 * useCategories Hook
 * Fetches and manages product categories.
 *
 * @param {Object} [options]
 * @param {boolean} [options.autoFetch=true] - Whether to fetch categories on mount
 * @returns {Object} { categories, loading, error, refetch, getCategoryById, getCategoryByName }
 */
export const useCategories = ({ autoFetch = true } = {}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getCategories();
      // Handle both array response and paginated results format
      const list = Array.isArray(data) ? data : data.results || [];
      setCategories(list);
      return list;
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      const message =
        err.response?.data?.detail || 'Failed to load categories. Please try again.';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [autoFetch, fetchCategories]);

  // Helper: Find category by id
  const getCategoryById = useCallback(
    (id) => categories.find((c) => String(c.id) === String(id)),
    [categories]
  );

  // Helper: Find category by name (case-insensitive)
  const getCategoryByName = useCallback(
    (name) =>
      categories.find((c) => c.name.toLowerCase() === String(name).toLowerCase()),
    [categories]
  );

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    getCategoryById,
    getCategoryByName,
  };
};

export default useCategories;
