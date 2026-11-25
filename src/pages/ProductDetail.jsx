import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';
import useProductDetails from '../hooks/useProductDetails';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import ProductImageGallery from '../components/ProductDetails/ProductImageGallery';
import ProductInfo from '../components/ProductDetails/ProductInfo';
import ReviewSection from '../components/Reviews/ReviewSection';
import ProductCard from '../components/Products/ProductCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import productService from '../services/productService';

/**
 * ProductDetail Page
 * Full product view strictly matching nexamart_app.tsx design.
 * Integrates image gallery, pricing, stock, description/reviews tabs, and related products.
 */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const {
    product,
    selectedImage,
    setSelectedImage,
    reviews,
    reviewsLoading,
    totalReviews,
    averageRating,
    loading,
    error,
    refetchProduct,
    submitReview,
    updateReview,
    deleteReview,
  } = useProductDetails(id);

  // Scroll to top whenever the product id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Fetch related products based on category or fallback to latest products
  useEffect(() => {
    if (!product) return;

    let isMounted = true;
    const fetchRelated = async () => {
      setRelatedLoading(true);
      try {
        const categoryId =
          typeof product.category === 'object'
            ? product.category?.id
            : product.category;

        const params = categoryId ? { category_id: categoryId } : {};
        const response = await productService.getProducts(params);
        const list = Array.isArray(response) ? response : response.results || [];

        // Exclude current product and take up to 4 items
        const filtered = list
          .filter((p) => String(p.id) !== String(product.id))
          .slice(0, 4);

        if (isMounted) {
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Failed to load related products:', err);
      } finally {
        if (isMounted) {
          setRelatedLoading(false);
        }
      }
    };

    fetchRelated();

    return () => {
      isMounted = false;
    };
  }, [product]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4">
        <LoadingSpinner size="lg" message="Loading product details..." />
      </div>
    );
  }

  // Error or Not Found Screen
  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-2xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Product Not Found
        </h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          {error ||
            'The product you are looking for might have been removed, had its name changed, or is temporarily unavailable.'}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </Link>
          <button
            type="button"
            onClick={refetchProduct}
            className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Category display label
  const categoryLabel =
    typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : product.category_name ||
        (typeof product.category === 'string' ? product.category : 'Shop');

  const categoryId =
    typeof product.category === 'object' ? product.category?.id : product.category;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="flex text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 flex-wrap">
          <li className="inline-flex items-center">
            <Link
              to="/"
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
          </li>
          <li>
            <Link
              to={categoryId ? `/products?category=${categoryId}` : '/products'}
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {categoryLabel}
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
          </li>
          <li
            className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md"
            aria-current="page"
          >
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main 2-Column Product Section */}
      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        {/* Left Column: Image Gallery */}
        <div className="lg:w-1/2">
          <ProductImageGallery
            images={product.images || []}
            fallbackImage={product.image}
            productName={product.name}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
          />
        </div>

        {/* Right Column: Product Metadata & Actions */}
        <div className="lg:w-1/2">
          <ProductInfo
            product={product}
            averageRating={averageRating}
            totalReviews={totalReviews}
            onReviewsClick={() => {
              setActiveTab('reviews');
              const tabsEl = document.getElementById('product-tabs-section');
              if (tabsEl) {
                tabsEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onAddToCart={async (prod, qty) => {
              const res = await addToCart(prod, qty);
              if (res?.requireAuth) {
                navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
              }
            }}
          />
        </div>
      </div>

      {/* Details & Reviews Tabs */}
      <div id="product-tabs-section" className="border-t border-slate-200 pt-10 mb-16 scroll-mt-24">
        {/* Tab Headers */}
        <div className="flex space-x-8 mb-8 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`pb-4 text-lg font-bold transition-colors relative cursor-pointer ${
              activeTab === 'description'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Description
            {activeTab === 'description' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-lg font-bold transition-colors relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Reviews</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {totalReviews}
            </span>
            {activeTab === 'reviews' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'description' ? (
          <div className="space-y-8 animate-fade-in">
            {/* Long Description Text */}
            <div className="prose prose-indigo max-w-none text-slate-600 leading-relaxed text-base sm:text-lg">
              <p>
                {product.description ||
                  `Experience the ultimate in quality and performance with our premium ${product.name.toLowerCase()}. Designed with both modern aesthetics and long-lasting durability in mind, this product seamlessly integrates into your daily life.`}
              </p>
            </div>

            {/* Highlights Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    Authentic Guarantee
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    100% genuine product sourced directly from verified manufacturers.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    Quality Tested
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Individually inspected and packed securely for damage-free delivery.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    Warranty Support
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Backed by official warranty and dedicated NexaMart customer care.
                  </p>
                </div>
              </div>
            </div>

            {/* Specifications Table */}
            <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Product Specifications
                </h4>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 text-sm">
                  <span className="font-semibold text-slate-500">Product SKU / ID</span>
                  <span className="sm:col-span-2 font-mono text-slate-900">
                    #NEXA-{product.id}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 text-sm">
                  <span className="font-semibold text-slate-500">Category</span>
                  <span className="sm:col-span-2 text-slate-900">
                    {categoryLabel}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 text-sm">
                  <span className="font-semibold text-slate-500">Availability</span>
                  <span className="sm:col-span-2 text-slate-900 font-medium">
                    {product.stock > 0
                      ? `In Stock (${product.stock} units available)`
                      : 'Out of Stock'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 text-sm">
                  <span className="font-semibold text-slate-500">VAT / Tax</span>
                  <span className="sm:col-span-2 text-slate-900">
                    Price includes 15% standard VAT
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-3.5 text-sm">
                  <span className="font-semibold text-slate-500">Shipping</span>
                  <span className="sm:col-span-2 text-slate-900">
                    Nationwide standard and express delivery across Bangladesh
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <ReviewSection
              reviews={reviews}
              averageRating={averageRating}
              totalReviews={totalReviews}
              currentUser={user}
              isAuthenticated={isAuthenticated}
              onSubmitReview={submitReview}
              onDeleteReview={deleteReview}
              onUpdateReview={updateReview}
              loading={reviewsLoading}
            />
          </div>
        )}
      </div>

      {/* Related Products ("You May Also Like") Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-slate-200 pt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                You May Also Like
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                More trending items in {categoryLabel}
              </p>
            </div>
            <Link
              to={categoryId ? `/products?category=${categoryId}` : '/products'}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:gap-2 transition-all"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={async (prod) => {
                  const res = await addToCart(prod, 1);
                  if (res?.requireAuth) {
                    navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
