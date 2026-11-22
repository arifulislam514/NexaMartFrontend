import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';

/**
 * ProductImageGallery Component
 * Main image preview and interactive thumbnails carousel strictly following nexamart_app.tsx design.
 *
 * @param {Object} props
 * @param {Array} [props.images=[]] - Array of image objects [{ id, image }] from Django API
 * @param {string} [props.fallbackImage] - Optional default single image URL
 * @param {string} [props.productName='Product'] - For accessible alt tags
 * @param {string} [props.selectedImage] - Controlled selected image URL
 * @param {Function} [props.onSelectImage] - Callback on thumbnail selection
 * @param {string} [props.className='']
 */
const ProductImageGallery = ({
  images = [],
  fallbackImage = '',
  productName = 'Product',
  selectedImage: controlledImage,
  onSelectImage,
  className = '',
}) => {
  // Normalize images list into an array of URL strings
  const imageList = React.useMemo(() => {
    const list = [];
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((img) => {
        const url = typeof img === 'object' && img?.image ? img.image : img;
        if (url && typeof url === 'string') {
          list.push(url);
        }
      });
    }

    if (list.length === 0 && fallbackImage) {
      list.push(fallbackImage);
    }

    if (list.length === 0) {
      list.push(productService.getProductImage(null));
    }

    return list;
  }, [images, fallbackImage]);

  // Internal active image state (with fallback to first image)
  const [activeImage, setActiveImage] = useState(
    controlledImage || imageList[0] || ''
  );

  useEffect(() => {
    if (controlledImage) {
      setActiveImage(controlledImage);
    } else if (imageList.length > 0 && !imageList.includes(activeImage)) {
      setActiveImage(imageList[0]);
    }
  }, [controlledImage, imageList, activeImage]);

  const handleThumbnailClick = (imgUrl) => {
    setActiveImage(imgUrl);
    if (onSelectImage) {
      onSelectImage(imgUrl);
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Main Hero Preview */}
      <div className="w-full aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 relative group shadow-xs">
        <img
          src={activeImage}
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = productService.getProductImage(null);
          }}
        />
      </div>

      {/* Thumbnails Row (displayed when multiple images exist) */}
      {imageList.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4">
          {imageList.map((imgUrl, idx) => {
            const isSelected = imgUrl === activeImage;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleThumbnailClick(imgUrl)}
                className={`aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-200 opacity-100 scale-[0.98]'
                    : 'border-transparent hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
                aria-label={`View ${productName} image ${idx + 1}`}
              >
                <img
                  src={imgUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover transition-opacity"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = productService.getProductImage(null);
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
