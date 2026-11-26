import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Package,
  Layers,
  X,
  Loader2,
} from 'lucide-react';
import productService from '../../../services/productService';

/**
 * ManageCategories Component
 * Admin Category Management table and creation/editing modal.
 * Strictly adheres to API_DOCUMENTATION.md Section 2.2 (/api/v1/categories/).
 */
const ManageCategories = ({ className = '' }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete State
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getCategories();
      const list = Array.isArray(data) ? data : data?.results || [];
      setCategories(list);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err.response?.data?.detail || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Save (Create or Update) Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Category name is required.');
      return;
    }

    setSaving(true);
    setModalError(null);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    try {
      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, payload);
        setFeedbackMessage({
          type: 'success',
          text: `Category "${payload.name}" updated successfully!`,
        });
      } else {
        await productService.createCategory(payload);
        setFeedbackMessage({
          type: 'success',
          text: `Category "${payload.name}" created successfully!`,
        });
      }

      setIsModalOpen(false);
      fetchCategories();
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save category:', err);
      const msg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        'Failed to save category.';
      setModalError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Delete Category
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    setDeleteLoading(true);
    try {
      await productService.deleteCategory(deletingCategory.id);
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      setFeedbackMessage({
        type: 'success',
        text: `Category "${deletingCategory.name}" deleted successfully.`,
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
      setDeletingCategory(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
      setFeedbackMessage({
        type: 'error',
        text:
          err.response?.data?.detail ||
          'Failed to delete category. Ensure no products are actively attached.',
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto space-y-6 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Category Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Organize products into departments, manage taxonomies, and storefront groupings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCategories}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Refresh categories"
            aria-label="Refresh categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
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
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
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

      {/* Categories Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            />
          </div>

          <div className="text-xs text-slate-400 font-semibold">
            {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 mb-2">{error}</p>
              <button
                type="button"
                onClick={fetchCategories}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Tag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="font-bold text-slate-800 text-base mb-1">
                No categories found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No departments match your query. Add a new category to organize your products.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Department / Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Associated Products</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50 transition-colors group">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center flex-shrink-0 border border-indigo-100/80">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {category.name}
                          </span>
                          <span className="block text-[11px] font-mono text-slate-400">
                            #CAT-{category.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4">
                      <p className="text-slate-600 text-xs max-w-md truncate">
                        {category.description || 'No description provided.'}
                      </p>
                    </td>

                    {/* Product Count */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span>{category.product_count !== undefined ? category.product_count : '—'}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/products?category=${category.id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View products in this category"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(category)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingCategory(category)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Home & Kitchen"
                  disabled={saving}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Short description of items in this department..."
                  disabled={saving}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
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
              Delete Category?
            </h3>
            <p className="text-slate-600 text-sm text-center mb-6 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900">&quot;{deletingCategory.name}&quot;</strong>?
              {deletingCategory.product_count > 0 && (
                <span className="block mt-2 font-bold text-rose-600">
                  Notice: This category currently contains {deletingCategory.product_count} products.
                </span>
              )}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingCategory(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteConfirm}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
