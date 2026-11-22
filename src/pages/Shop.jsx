import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import useProducts from '../hooks/useProducts';
import useCategories from '../hooks/useCategories';
import SearchBar from '../components/Shop/SearchBar';
import FilterSidebar from '../components/Shop/FilterSidebar';
import SortDropdown from '../components/Shop/SortDropdown';
import ProductGrid from '../components/Products/ProductGrid';
import Pagination from '../components/Common/Pagination';
import ErrorAlert from '../components/Common/ErrorAlert';

/**
 * Shop Page Component
 * Main catalog page connecting server-side products with filters, search, and sorting.
 * Strictly adheres to nexamart_app.tsx design.
 */
const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('ordering') || '-updated_at';
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;
  const minPriceParam = searchParams.get('price__gt') || '';
  const maxPriceParam = searchParams.get('price__lt') || '';

  // Fetch categories
  const { categories, loading: categoriesLoading, getCategoryByName } = useCategories();

  // Resolve category ID from URL (supports both category ID and category Name)
  const resolvedCategoryId = React.useMemo(() => {
    if (!categoryParam) return '';
    if (!isNaN(categoryParam)) return Number(categoryParam);
    const matched = getCategoryByName(categoryParam);
    return matched ? matched.id : '';
  }, [categoryParam, getCategoryByName]);

  // Products custom hook
  const {
    products,
    count,
    loading,
    error,
    currentPage,
    setPage,
    setSearch,
    setCategory,
    setOrdering,
    setPriceRange,
    resetFilters,
    refetch,
  } = useProducts({
    page: pageParam,
    search: searchParam,
    category_id: resolvedCategoryId,
    ordering: sortParam,
    price__gt: minPriceParam,
    price__lt: maxPriceParam,
  });

  // Keep hook in sync when URL search params change
  useEffect(() => {
    setSearch(searchParam);
    setCategory(resolvedCategoryId);
    setOrdering(sortParam);
    setPage(pageParam);
    setPriceRange(minPriceParam, maxPriceParam);
  }, [
    searchParam,
    resolvedCategoryId,
    sortParam,
    pageParam,
    minPriceParam,
    maxPriceParam,
    setSearch,
    setCategory,
    setOrdering,
    setPage,
    setPriceRange,
  ]);

  // Update URL helper
  const updateParams = (newParams) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        next.set(k, v);
      } else {
        next.delete(k);
      }
    });
    setSearchParams(next);
  };

  // Handlers
  const handleSearch = (term) => {
    updateParams({ search: term, page: 1 });
  };

  const handleSelectCategory = (catId) => {
    updateParams({ category: catId, page: 1 });
  };

  const handleSortChange = (newSort) => {
    updateParams({ ordering: newSort, page: 1 });
  };

  const handlePriceChange = (min, max) => {
    updateParams({ price__gt: min, price__lt: max, page: 1 });
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    resetFilters();
    setSearchParams({});
  };

  // Compute active category name for title/breadcrumbs
  const activeCategoryObj = categories.find((c) => String(c.id) === String(resolvedCategoryId));
  const pageTitle = searchParam
    ? `Search results for "${searchParam}"`
    : activeCategoryObj
    ? activeCategoryObj.name
    : 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
          <li className="inline-flex items-center">
            <Link to="/" className="hover:text-indigo-600 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </li>
          <li>
            <Link to="/products" className="hover:text-indigo-600 transition-colors">
              Shop
            </Link>
          </li>
          {activeCategoryObj && (
            <>
              <li>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </li>
              <li className="font-semibold text-slate-900" aria-current="page">
                {activeCategoryObj.name}
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Page Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            Showing {count} {count === 1 ? 'product' : 'products'} available in store
          </p>
        </div>

        {/* Catalog Search Bar */}
        <div className="w-full md:w-80">
          <SearchBar value={searchParam} onSearch={handleSearch} />
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Filter Sidebar */}
        <FilterSidebar
          categories={categories}
          selectedCategory={resolvedCategoryId}
          onSelectCategory={handleSelectCategory}
          minPrice={minPriceParam}
          maxPrice={maxPriceParam}
          onPriceChange={handlePriceChange}
          onReset={handleClearFilters}
          loadingCategories={categoriesLoading}
        />

        {/* Right Main Content */}
        <main className="flex-1 min-w-0">
          {/* Sorting Toolbar */}
          <SortDropdown
            value={sortParam}
            onChange={handleSortChange}
            totalResults={count}
          />

          {/* Error Banner */}
          {error && (
            <div className="mb-6">
              <ErrorAlert message={error} onRetry={refetch} />
            </div>
          )}

          {/* Products Grid / Skeletons / Empty State */}
          <ProductGrid
            products={products}
            loading={loading}
            skeletonCount={8}
            onClearFilters={handleClearFilters}
          />

          {/* Pagination Controls */}
          {!loading && count > 0 && (
            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalCount={count}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
