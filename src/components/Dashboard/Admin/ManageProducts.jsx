import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Package,
  CheckCircle2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Store,
  ExternalLink,
} from 'lucide-react';
import productService from '../../../services/productService';
import adminService from '../../../services/adminService';
import { useCategories } from '../../../hooks/useCategories';
import { formatPrice } from '../../../utils/formatters';
import ProductForm from './ProductForm';

/**
 * ManageProducts Component
 * Comprehensive product catalog table for Admin Dashboard matching nexamart_app.tsx design.
 * Features:
 * - Search by keyword & filter by category or stock level (Low / Out of Stock)
 * - Bulk selection and quick delete confirmation modal
 * - Direct links to view storefront product and trigger product editing
 * - Pagination controls and inventory health indicators
 *
 * @param {Object} props
 * @param {Function} [props.onAddNew] - Handler when "Add New Product" is clicked
 * @param {Function} [props.onEdit] - Handler when edit button is clicked: (product) => void
 * @param {string} [props.className='']
 */
const ManageProducts = ({ onAddNew, onEdit, className = '' }) => {
  const navigate = useNavigate();
  const { categories } = useCategories({ autoFetch: true });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState('all');
  const [selectedSellerFilter, setSelectedSellerFilter] = useState('all');
  const [sellersList, setSellersList] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Selection states
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Product Form Modal state
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        page_size: pageSize,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (selectedCategory !== 'all') {
        params.category_id = selectedCategory;
      }

      if (sortBy === 'price_asc') {
        params.ordering = 'price';
      } else if (sortBy === 'price_desc') {
        params.ordering = '-price';
      } else if (sortBy === 'newest') {
        params.ordering = '-id';
      }

      const response = await productService.getProducts(params);
      let list = [];
      let count = 0;

      if (Array.isArray(response)) {
        list = response;
        count = response.length;
      } else if (response && Array.isArray(response.results)) {
        list = response.results;
        count = response.count || response.results.length;
      }

      setProducts(list);
      setTotalCount(count);
    } catch (err) {
      console.error('Failed to load products in admin panel:', err);
      const msg = err.response?.data?.detail || 'Failed to load product catalog.';
      setError(msg);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedCategory, sortBy]);

  // Load products when filters or pagination change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Load registered sellers for vendor filtering
  useEffect(() => {
    let isMounted = true;
    const loadVendors = async () => {
      try {
        const data = await adminService.getSellers();
        const list = Array.isArray(data) ? data : data?.results || [];
        if (isMounted) {
          setSellersList(list);
        }
      } catch (e) {
        // Silently handle
      }
    };
    loadVendors();
    return () => {
      isMounted = false;
    };
  }, []);

  // Client-side stock and vendor filtering
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    let list = products;

    if (selectedSellerFilter !== 'all') {
      if (selectedSellerFilter === 'in_house') {
        list = list.filter((p) => !p.seller);
      } else {
        list = list.filter((p) => p.seller && String(p.seller.id) === String(selectedSellerFilter));
      }
    }

    if (selectedStockFilter === 'low_stock') {
      return list.filter((p) => Number(p.stock) <= 5 && Number(p.stock) > 0);
    }
    if (selectedStockFilter === 'out_of_stock') {
      return list.filter((p) => Number(p.stock) === 0);
    }
    if (selectedStockFilter === 'in_stock') {
      return list.filter((p) => Number(p.stock) > 0);
    }
    return list;
  }, [products, selectedStockFilter, selectedSellerFilter]);

  // Bulk selection toggles
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(filteredProducts.map((p) => p.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  // Delete product action
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    setActionLoading(true);
    try {
      await productService.deleteProduct(deletingProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setSelectedIds((prev) => {
        const copy = new Set(prev);
        copy.delete(deletingProduct.id);
        return copy;
      });

      setFeedbackMessage({
        type: 'success',
        text: `Product "${deletingProduct.name}" deleted successfully.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
      setDeletingProduct(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to delete product.',
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className={`p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Products Catalog
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your store&apos;s inventory, pricing, and product details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Refresh product list"
            aria-label="Refresh product list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (onAddNew) {
                onAddNew();
              } else {
                setEditingProduct(null);
                setIsProductFormOpen(true);
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-2xs border animate-fade-in ${
            feedbackMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            )}
            <span className="text-sm font-semibold">{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
          {/* Keyword Search */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="flex-1 sm:flex-none bg-white border border-slate-300 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 px-3.5 py-2 outline-none font-medium cursor-pointer shadow-2xs"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Vendor Filter Dropdown */}
            <select
              value={selectedSellerFilter}
              onChange={(e) => setSelectedSellerFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-white border border-slate-300 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 px-3.5 py-2 outline-none font-medium cursor-pointer shadow-2xs"
            >
              <option value="all">All Vendors</option>
              <option value="in_house">In-House Platform</option>
              {sellersList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.store_name}
                </option>
              ))}
            </select>

            {/* Stock Filter Dropdown */}
            <select
              value={selectedStockFilter}
              onChange={(e) => setSelectedStockFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-white border border-slate-300 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 px-3.5 py-2 outline-none font-medium cursor-pointer shadow-2xs"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock (&gt;0)</option>
              <option value="low_stock">Low Stock (≤5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="flex-1 sm:flex-none bg-white border border-slate-300 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 px-3.5 py-2 outline-none font-medium cursor-pointer shadow-2xs"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Selected Items Floating Action Banner */}
        {selectedIds.size > 0 && (
          <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-indigo-900 animate-fade-in">
            <span>
              {selectedIds.size} {selectedIds.size === 1 ? 'product' : 'products'} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Products Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center text-slate-500">
              <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 mb-2">{error}</p>
              <button
                type="button"
                onClick={fetchProducts}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="font-bold text-slate-800 text-base mb-1">
                No products found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                No items match your active filters. Try modifying your search keywords or resetting filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStockFilter('all');
                  setSortBy('newest');
                  setPage(1);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedIds.size === filteredProducts.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      aria-label="Select all products"
                    />
                  </th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const isSelected = selectedIds.has(product.id);
                  const isOutOfStock = Number(product.stock) === 0;
                  const isLowStock = Number(product.stock) > 0 && Number(product.stock) <= 5;
                  const thumb = productService.getProductImage(product);

                  const categoryLabel =
                    product.category_name ||
                    (typeof product.category === 'object' && product.category?.name
                      ? product.category.name
                      : categories.find((c) => String(c.id) === String(product.category))?.name ||
                        (typeof product.category === 'string' ? product.category : 'General'));

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-slate-50 transition-colors group ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(product.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          aria-label={`Select ${product.name}`}
                        />
                      </td>

                      {/* Product Thumbnail & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                            <img
                              src={thumb}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  'https://placehold.co/100x100/e2e8f0/475569?text=Item';
                              }}
                            />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <Link
                              to={`/products/${product.id}`}
                              className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate block"
                            >
                              {product.name}
                            </Link>
                            <span className="text-xs font-mono text-slate-400">
                              #NEXA-{product.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Vendor Badge */}
                      <td className="px-6 py-4">
                        {product.seller ? (
                          <Link
                            to={`/stores/${product.seller.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                            title={`View ${product.seller.store_name} storefront`}
                          >
                            <Store className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="truncate max-w-[130px]">{product.seller.store_name}</span>
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60">
                            In-House
                          </span>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-semibold border border-slate-200">
                          {categoryLabel}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-900">
                          {formatPrice(product.price)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          VAT incl.
                        </div>
                      </td>

                      {/* Stock Pill Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isOutOfStock
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isLowStock
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOutOfStock
                                ? 'bg-rose-500'
                                : isLowStock
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View on storefront */}
                          <Link
                            to={`/products/${product.id}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="View product storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit Product */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onEdit) {
                                onEdit(product);
                              } else {
                                setEditingProduct(product);
                                setIsProductFormOpen(true);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit product details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Product */}
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(product)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-medium">
          <span>
            Showing{' '}
            <strong className="text-slate-800">
              {filteredProducts.length === 0 ? 0 : (page - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-800">
              {Math.min(page * pageSize, totalCount)}
            </strong>{' '}
            of <strong className="text-slate-800">{totalCount}</strong> results
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs font-semibold text-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            <span className="text-xs font-bold text-slate-700 px-2">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs font-semibold text-xs cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-2xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
              Delete Product?
            </h3>
            <p className="text-slate-600 text-sm text-center mb-6 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">&quot;{deletingProduct.name}&quot;</strong>?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setDeletingProduct(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteConfirm}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Create & Edit Modal Form */}
      {isProductFormOpen && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setIsProductFormOpen(false);
            setEditingProduct(null);
          }}
          onSuccess={(saved) => {
            setIsProductFormOpen(false);
            setEditingProduct(null);
            fetchProducts();
            setFeedbackMessage({
              type: 'success',
              text: `Product "${saved?.name || 'Item'}" successfully ${
                editingProduct ? 'updated' : 'created'
              }!`,
            });
            setTimeout(() => setFeedbackMessage(null), 4000);
          }}
        />
      )}
    </div>
  );
};

export default ManageProducts;
