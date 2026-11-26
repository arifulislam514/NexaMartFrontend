import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Layers,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
} from 'lucide-react';
import sellerService from '../../services/sellerService';
import useCategories from '../../hooks/useCategories';
import ProductImageManager from './ProductImageManager';
import { CURRENCY_SYMBOL } from '../../utils/formatters';

/**
 * SellerProductModal Component
 * Create and edit product modal dialog for verified merchants.
 *
 * @param {Object} props
 * @param {Object} [props.product] - Product data if editing, null if creating
 * @param {Function} props.onClose - Modal close handler
 * @param {Function} props.onSuccess - Callback after product is created/updated: (product) => void
 */
const SellerProductModal = ({ product = null, onClose, onSuccess }) => {
  const isEditMode = Boolean(product && product.id);
  const { categories, loading: categoriesLoading } = useCategories({ autoFetch: true });

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'images'
  const [createdProduct, setCreatedProduct] = useState(product);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category:
      typeof product?.category === 'object'
        ? product?.category?.id || ''
        : product?.category || '',
    price: product?.price !== undefined ? String(product?.price) : '',
    stock: product?.stock !== undefined ? String(product?.stock) : '',
    description: product?.description || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Sync state if product prop changes
  useEffect(() => {
    if (product) {
      setCreatedProduct(product);
      setFormData({
        name: product.name || '',
        category:
          typeof product.category === 'object'
            ? product.category?.id || ''
            : product.category || '',
        price: product.price !== undefined ? String(product.price) : '',
        stock: product.stock !== undefined ? String(product.stock) : '',
        description: product.description || '',
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category || !formData.price || formData.stock === '') {
      setError('Please fill in all required fields (Name, Category, Price, Stock).');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        category: Number(formData.category),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        description: formData.description.trim(),
      };

      let result;
      if (isEditMode) {
        result = await sellerService.updateProduct(product.id, payload);
      } else {
        result = await sellerService.createProduct(payload);
        setCreatedProduct(result);
      }

      onSuccess(result);

      // If in create mode, switch to images tab so seller can immediately upload photos!
      if (!isEditMode) {
        setActiveTab('images');
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      const detail =
        err.response?.data?.name?.[0] ||
        err.response?.data?.price?.[0] ||
        err.response?.data?.category?.[0] ||
        err.response?.data?.detail ||
        'Failed to save product. Please check your entries.';
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditMode
                  ? 'Update product pricing, inventory count, and details.'
                  : 'List a new item in your store catalog.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher if in edit mode or after product created */}
        {(isEditMode || createdProduct) && (
          <div className="flex border-b border-slate-100 px-6 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              General Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('images')}
              className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
                activeTab === 'images'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Gallery Images
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'details' ? (
            <form id="seller-product-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={categoriesLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price and Stock Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price ({CURRENCY_SYMBOL}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1200.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Available Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features, specifications, box contents, and warranty..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </form>
          ) : (
            <div>
              <ProductImageManager
                productId={createdProduct?.id || product?.id}
                onImagesChange={() => {}}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {activeTab === 'details' ? (
            <button
              type="submit"
              form="seller-product-form"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditMode ? 'Update Product' : 'Create & Add Images'}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Done Managing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProductModal;
