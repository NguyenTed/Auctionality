/**
 * ProductListPage Component
 * Displays products with filters, sorting, and pagination
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  searchProductsAsync,
  selectProducts,
  selectProductPagination,
  selectProductLoading,
} from "../../features/product/productSlice";
import { selectCategories } from "../../features/category/categorySlice";
import ProductGrid from "../../components/ProductGrid";
import FilterIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";

export default function ProductListPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParamsUrl] = useSearchParams();
  const products = useAppSelector(selectProducts);
  const pagination = useAppSelector(selectProductPagination);
  const isLoading = useAppSelector(selectProductLoading);
  const categories = useAppSelector(selectCategories);

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [categoryId, setCategoryId] = useState<number | null>(
    searchParams.get("categoryId") ? parseInt(searchParams.get("categoryId")!) : null
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "endTimeDesc");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (keyword) params.keyword = keyword;
    if (categoryId) params.categoryId = categoryId.toString();
    if (sort) params.sort = sort;
    if (page > 1) params.page = page.toString();

    setSearchParamsUrl(params, { replace: true });

    dispatch(
      searchProductsAsync({
        keyword: keyword || undefined,
        categoryId: categoryId || undefined,
        page,
        size: 20,
        sort,
      })
    );
  }, [keyword, categoryId, sort, page, dispatch, setSearchParamsUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCategoryChange = (catId: number | null) => {
    setCategoryId(catId);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Auctions</h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search for title, category..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FilterIcon fontSize="small" />
              Filters
            </button>

            <div className="flex items-center gap-2">
              <SortIcon fontSize="small" />
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="endTimeDesc">Ending Soon</option>
                <option value="endTimeAsc">Ending Latest</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>

            {categoryId && (
              <button
                onClick={() => handleCategoryChange(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear category filter
              </button>
            )}
          </div>

          {/* Category Filter */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    !categoryId
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      categoryId === cat.id
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          {pagination && (
            <p className="text-gray-600">
              Showing {products.length} of {pagination.totalItems} results
            </p>
          )}
        </div>

        {/* Product Grid */}
        <ProductGrid products={products} isLoading={isLoading} />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrevious || isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext || isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

