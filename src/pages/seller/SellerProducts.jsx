import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Image as ImageIcon,
} from 'lucide-react';
import sellerService from '../../services/sellerService';
import useCategories from '../../hooks/useCategories';
import SellerProductModal from '../../components/seller/SellerProductModal';
import { formatPrice } from '../../utils/formatters';

/**
 * SellerProducts Page
 * Manage seller's product catalog with live inventory tracking, search, edit, and deletion.
 * Path: /seller/products
 */
const SellerProducts = () => {
  const { categories } = useCategories({ autoFetch: true });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Deletion State
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch Seller's Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sellerService.getSellerProducts({ page_size: 100 });
      const list = Array.isArray(response) ? response : response?.results || [];
      setProducts(list);
    } catch (err) {
      console.error('Failed to load seller products:', err);
      setError(err.response?.data?.detail || 'Failed to load your products catalog.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Delete
  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      await sellerService.deleteProduct(deletingProduct.id);
      setFeedback({ type: 'success', message: `Product "${deletingProduct.name}" was deleted.` });
      setDeletingProduct(null);
      await fetchProducts();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error('Failed to delete product:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Could not delete product.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    let list = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => {
        const catId = typeof p.category === 'object' ? p.category?.id : p.category;
        return String(catId) === String(selectedCategory);
      });
    }

    // Stock level filter
    if (selectedStockStatus === 'low') {
      list = list.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5);
    } else if (selectedStockStatus === 'out') {
      list = list.filter((p) => Number(p.stock) === 0);
    } else if (selectedStockStatus === 'in') {
      list = list.filter((p) => Number(p.stock) > 5);
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedStockStatus]);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  // Category name resolver
  const getCategoryName = (cat) => {
    if (typeof cat === 'object' && cat?.name) return cat.name;
    const found = categories.find((c) => String(c.id) === String(cat));
    return found ? found.name : 'General';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Products Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your store's inventory, pricing, and product image galleries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center gap-3 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-emerald-600 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={selectedStockStatus}
            onChange={(e) => {
              setSelectedStockStatus(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-emerald-600 cursor-pointer"
          >
            <option value="all">All Stock Status</option>
            <option value="in">In Stock (&gt; 5)</option>
            <option value="low">Low Stock (1 - 5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh Products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading your catalog...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              {searchQuery || selectedCategory !== 'all' || selectedStockStatus !== 'all'
                ? 'No products match your active search filters.'
                : 'You have not uploaded any products yet. Click below to add your first product.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Product Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Product Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedProducts.map((p) => {
                  const heroImg =
                    Array.isArray(p.images) && p.images.length > 0
                      ? p.images[0]?.image
                      : p.image || null;

                  const stockNum = Number(p.stock) || 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Product Name & Image */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {heroImg ? (
                              <img src={heroImg} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate max-w-xs sm:max-w-sm">
                              {p.name}
                            </p>
                            <span className="text-[11px] text-slate-400">ID: #{p.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {getCategoryName(p.category)}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-extrabold text-slate-900">
                        {formatPrice(p.price)}
                      </td>

                      {/* Stock Level */}
                      <td className="py-4 px-4">
                        {stockNum === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Out of Stock
                          </span>
                        ) : stockNum <= 5 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Low Stock ({stockNum})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            In Stock ({stockNum})
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit / Manage Images */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setModalOpen(true);
                            }}
                            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                            title="Edit Product & Manage Images"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(p)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete Product"
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
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50/50">
            <span>
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length} items
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <SellerProductModal
          product={editingProduct}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            fetchProducts();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setDeletingProduct(null)}
          />

          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 z-10 text-center animate-scale-up">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Product?</h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6">
              Are you sure you want to delete <strong className="text-slate-800">"{deletingProduct.name}"</strong>?
              This will remove the product and its images from the marketplace permanently.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-md disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
