import { useState, useEffect, useCallback, useMemo } from 'react';
import productService from '../services/productService';
import { APP_CONFIG } from '../utils/constants';

/**
 * useProducts Hook
 * Handles product listing with server-side pagination, search, category filter, price range, and ordering.
 * Strictly complies with API_DOCUMENTATION.md Section 2.3.
 *
 * @param {Object} [initialFilters]
 * @param {number} [initialFilters.page=1]
 * @param {string} [initialFilters.search='']
 * @param {number|string} [initialFilters.category_id='']
 * @param {string} [initialFilters.ordering='-updated_at']
 * @param {number|string} [initialFilters.price__gt='']
 * @param {number|string} [initialFilters.price__lt='']
 * @param {boolean} [initialFilters.autoFetch=true]
 */
export const useProducts = (initialFilters = {}) => {
  const { autoFetch = true, ...defaultFilterValues } = initialFilters;

  const [filters, setFilters] = useState({
    page: defaultFilterValues.page || 1,
    search: defaultFilterValues.search || '',
    category_id: defaultFilterValues.category_id || '',
    ordering: defaultFilterValues.ordering || '',
    price__gt: defaultFilterValues.price__gt || '',
    price__lt: defaultFilterValues.price__lt || '',
  });

  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts(filters);
      // Django DRF paginated response: { count, next, previous, results }
      if (data && Array.isArray(data.results)) {
        setProducts(data.results);
        setCount(data.count || 0);
        setNext(data.next);
        setPrevious(data.previous);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setCount(data.length);
        setNext(null);
        setPrevious(null);
      } else {
        setProducts([]);
        setCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      const message =
        err.response?.data?.detail || 'Failed to load products. Please try again.';
      setError(message);
      setProducts([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  // Total pages computed from total count
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(count / APP_CONFIG.DEFAULT_PAGE_SIZE));
  }, [count]);

  // Filter setters
  const setPage = useCallback((newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const setSearch = useCallback((searchTerm) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1, // reset to page 1 on new search
    }));
  }, []);

  const setCategory = useCallback((categoryId) => {
    setFilters((prev) => ({
      ...prev,
      category_id: categoryId,
      page: 1, // reset to page 1 on category change
    }));
  }, []);

  const setOrdering = useCallback((order) => {
    setFilters((prev) => ({
      ...prev,
      ordering: order,
      page: 1,
    }));
  }, []);

  const setPriceRange = useCallback((min, max) => {
    setFilters((prev) => ({
      ...prev,
      price__gt: min !== undefined && min !== null ? min : '',
      price__lt: max !== undefined && max !== null ? max : '',
      page: 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      search: '',
      category_id: '',
      ordering: '',
      price__gt: '',
      price__lt: '',
    });
  }, []);

  return {
    products,
    count,
    totalPages,
    currentPage: filters.page,
    hasNext: Boolean(next),
    hasPrevious: Boolean(previous),
    filters,
    loading,
    error,
    setPage,
    setSearch,
    setCategory,
    setOrdering,
    setPriceRange,
    resetFilters,
    refetch: fetchProducts,
  };
};

export default useProducts;
