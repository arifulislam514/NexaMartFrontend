import React, { useState, useEffect } from 'react';
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import sellerService from '../../services/sellerService';

/**
 * ProductImageManager Component
 * Allows sellers to upload multiple product gallery images and delete images.
 * Endpoints:
 * - GET /api/v1/seller/products/{id}/images/
 * - POST /api/v1/seller/products/{id}/images/
 * - DELETE /api/v1/seller/products/{id}/images/{imageId}/
 *
 * @param {Object} props
 * @param {number|string} props.productId - Product ID
 * @param {Function} [props.onImagesChange] - Callback when images are added or removed
 */
const ProductImageManager = ({ productId, onImagesChange }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Fetch images for this product
  const fetchImages = async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await sellerService.getProductImages(productId);
      const list = Array.isArray(data) ? data : data?.results || [];
      setImages(list);
      if (onImagesChange) onImagesChange(list);
    } catch (err) {
      console.error('Failed to load product images:', err);
      setError('Failed to load gallery images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [productId]);

  // Handle uploading a new image
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('Image file size must be less than 3MB.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      await sellerService.uploadProductImage(productId, formData);
      setSuccess('Image uploaded successfully!');
      await fetchImages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError(err.response?.data?.image?.[0] || 'Failed to upload image.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Handle deleting an image
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    setDeletingId(imageId);
    setError(null);
    try {
      await sellerService.deleteProductImage(productId, imageId);
      await fetchImages();
    } catch (err) {
      console.error('Failed to delete image:', err);
      setError('Failed to delete image.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Product Image Gallery</h4>
          <p className="text-xs text-slate-500">
            Upload multiple photos from different angles to increase conversion.
          </p>
        </div>

        {/* Upload Trigger Button */}
        <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-colors cursor-pointer shadow-2xs">
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div className="h-32 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : images.length === 0 ? (
        <div className="p-6 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-600 font-medium">No gallery images uploaded yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Click "Add Image" above to upload product photos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-2xs"
            >
              <img
                src={img.image}
                alt="Product gallery"
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />

              {/* Delete overlay button */}
              <button
                type="button"
                onClick={() => handleDeleteImage(img.id)}
                disabled={deletingId === img.id}
                className="absolute top-2 right-2 p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md disabled:opacity-100 cursor-pointer"
                title="Delete Image"
              >
                {deletingId === img.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
