import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Package,
  DollarSign,
  Tag,
  FileText,
  Layers,
} from 'lucide-react';
import productService from '../../../services/productService';
import { useCategories } from '../../../hooks/useCategories';
import { CURRENCY_SYMBOL } from '../../../utils/formatters';

/**
 * ProductForm Component
 * Admin modal & standalone form for creating and updating products.
 * Includes multi-image upload with local preview and backend synchronization
 * strictly adhering to API_DOCUMENTATION.md Section 2.3 & 2.4.
 *
 * @param {Object} props
 * @param {Object} [props.product] - Product data if in Edit mode
 * @param {Function} props.onClose - Modal dismissal handler
 * @param {Function} [props.onSuccess] - Callback when product is created/updated: (savedProduct) => void
 * @param {string} [props.className='']
 */
const ProductForm = ({
  product = null,
  onClose,
  onSuccess,
  className = '',
}) => {
  const isEditMode = Boolean(product && product.id);
  const { categories, loading: categoriesLoading } = useCategories({ autoFetch: true });
  const fileInputRef = useRef(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
  });

  // Image Upload State
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]); // Array<{ file: File, preview: string, id: string }>
  const [deletingImageId, setDeletingImageId] = useState(null);

  // Status & Validation State
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Populate data when editing an existing product
  useEffect(() => {
    if (product) {
      const categoryId =
        typeof product.category === 'object'
          ? product.category?.id
          : product.category;

      setFormData({
        name: product.name || '',
        category: categoryId ? String(categoryId) : '',
        price: product.price !== undefined ? String(product.price) : '',
        stock: product.stock !== undefined ? String(product.stock) : '',
        description: product.description || '',
      });

      // Existing image list from API
      if (Array.isArray(product.images)) {
        setExistingImages(product.images);
      } else if (product.image) {
        setExistingImages([{ id: 'hero', image: product.image }]);
      } else {
        setExistingImages([]);
      }
    } else {
      setFormData({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
      });
      setExistingImages([]);
    }
    setNewImageFiles([]);
    setValidationErrors({});
    setError(null);
  }, [product]);

  // Clean up object URLs when unmounting or files change
  useEffect(() => {
    return () => {
      newImageFiles.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [newImageFiles]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
    if (error) {
      setError(null);
    }
  };

  // Handle local file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = [];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit (API_DOCUMENTATION.md Section 2.4)

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not a supported image file.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setError(`"${file.name}" exceeds the 10MB maximum file size.`);
        return;
      }

      validFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      });
    });

    if (validFiles.length > 0) {
      setNewImageFiles((prev) => [...prev, ...validFiles]);
      setError(null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove queued local image before upload
  const handleRemoveQueuedImage = (id) => {
    setNewImageFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Delete already uploaded image from backend (Edit mode)
  const handleDeleteExistingImage = async (imageId) => {
    if (!product?.id || imageId === 'hero') {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      return;
    }

    if (window.confirm('Are you sure you want to delete this image permanently?')) {
      setDeletingImageId(imageId);
      try {
        await productService.deleteProductImage(product.id, imageId);
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      } catch (err) {
        console.error('Failed to delete image:', err);
        setError('Failed to delete image from server.');
      } finally {
        setDeletingImageId(null);
      }
    }
  };

  // Client-side Validation
  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required.';
    }

    if (!formData.category) {
      errors.category = 'Please select a category.';
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum < 0) {
      errors.price = 'Enter a valid price greater than or equal to 0.';
    }

    const stockNum = parseInt(formData.stock, 10);
    if (formData.stock === '' || isNaN(stockNum) || stockNum < 0) {
      errors.stock = 'Enter a valid stock quantity (0 or more).';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    setError(null);
    setStatusMessage(isEditMode ? 'Updating product details...' : 'Creating new product...');

    const payload = {
      name: formData.name.trim(),
      category: Number(formData.category),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      description: formData.description.trim(),
    };

    try {
      let savedProduct;

      if (isEditMode) {
        // PATCH /api/v1/products/{id}/
        savedProduct = await productService.updateProduct(product.id, payload);
      } else {
        // POST /api/v1/products/
        savedProduct = await productService.createProduct(payload);
      }

      const targetProductId = savedProduct.id;

      // Upload queued image files if any
      if (newImageFiles.length > 0 && targetProductId) {
        for (let i = 0; i < newImageFiles.length; i++) {
          setStatusMessage(`Uploading image ${i + 1} of ${newImageFiles.length}...`);
          try {
            await productService.uploadProductImage(targetProductId, newImageFiles[i].file);
          } catch (uploadErr) {
            console.error('Image upload warning:', uploadErr);
          }
        }
      }

      setStatusMessage('Product saved successfully!');

      if (onSuccess) {
        onSuccess(savedProduct);
      }

      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      const respData = err.response?.data;
      if (typeof respData === 'object' && respData !== null) {
        const fieldErrors = {};
        let generalMsg = '';
        Object.entries(respData).forEach(([k, v]) => {
          const msg = Array.isArray(v) ? v.join(' ') : String(v);
          if (['name', 'category', 'price', 'stock', 'description'].includes(k)) {
            fieldErrors[k] = msg;
          } else {
            generalMsg += `${k}: ${msg} `;
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          setValidationErrors(fieldErrors);
        }
        setError(
          generalMsg.trim() ||
            respData.detail ||
            'Failed to save product. Please check your inputs.'
        );
      } else {
        setError(err.message || 'An unexpected error occurred while saving.');
      }
    } finally {
      setSaving(false);
      setStatusMessage('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <div
        className={`bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scale-up ${className}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 id="product-form-title" className="text-xl font-bold text-slate-900">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditMode
                  ? 'Update product details, pricing, inventory, and images'
                  : 'Add a new catalog item to your NexaMart store'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-2xl flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label
              htmlFor="product-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
            >
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="product-name"
              value={formData.name}
              onChange={handleChange('name')}
              disabled={saving}
              placeholder="e.g. Pro Wireless Noise-Canceling Headphones"
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                validationErrors.name
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
            {validationErrors.name && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Row 2: Category, Price, Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category Select */}
            <div>
              <label
                htmlFor="product-category"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
              >
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="product-category"
                value={formData.category}
                onChange={handleChange('category')}
                disabled={saving || categoriesLoading}
                className={`w-full px-3 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                  validationErrors.category
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {validationErrors.category}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="product-price"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
              >
                Price ({CURRENCY_SYMBOL}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                  {CURRENCY_SYMBOL}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="product-price"
                  value={formData.price}
                  onChange={handleChange('price')}
                  disabled={saving}
                  placeholder="2500.00"
                  className={`w-full pl-8 pr-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.price
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />
              </div>
              {validationErrors.price && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {validationErrors.price}
                </p>
              )}
            </div>

            {/* Stock Quantity */}
            <div>
              <label
                htmlFor="product-stock"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
              >
                Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                id="product-stock"
                value={formData.stock}
                onChange={handleChange('stock')}
                disabled={saving}
                placeholder="25"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.stock
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {validationErrors.stock && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {validationErrors.stock}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="product-description"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
            >
              Description & Specifications
            </label>
            <textarea
              id="product-description"
              rows={4}
              value={formData.description}
              onChange={handleChange('description')}
              disabled={saving}
              placeholder="High-fidelity audio with active noise cancellation and 30-hour battery life..."
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-y"
            />
          </div>

          {/* Product Images Section ("image upload shoho") */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Product Images (Max 10MB each)
              </label>
              <span className="text-xs text-slate-400">
                {existingImages.length + newImageFiles.length} images selected
              </span>
            </div>

            {/* Existing Images (Edit mode) */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  Current Uploaded Images:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs"
                    >
                      <img
                        src={img.image}
                        alt="Product upload"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        disabled={deletingImageId === img.id || saving}
                        className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer disabled:opacity-50"
                        title="Delete image"
                      >
                        {deletingImageId === img.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-rose-400 hover:text-rose-300" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Queued Local Images Previews */}
            {newImageFiles.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-indigo-600">
                  Ready to Upload ({newImageFiles.length}):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {newImageFiles.map((item) => (
                    <div
                      key={item.id}
                      className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-indigo-400/50 bg-slate-100 group shadow-2xs"
                    >
                      <img
                        src={item.preview}
                        alt="Queued upload"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveQueuedImage(item.id)}
                        disabled={saving}
                        className="absolute top-1 right-1 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                        title="Remove from queue"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded truncate text-center">
                        {item.file.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileChange}
                disabled={saving}
                className="hidden"
              />
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Click to upload product photos
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                PNG, JPG, WEBP or GIF (Max 10MB per file)
              </p>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusMessage || 'Saving Product...'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{isEditMode ? 'Save Changes' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
