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
import { selectIsAuthenticated } from "../../features/auth/authSlice";
import {
  fetchWatchlistAsync,
  selectWatchlistProductIds,
} from "../../features/watchlist/watchlistSlice";
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
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const watchlistProductIds = useAppSelector(selectWatchlistProductIds);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWatchlistAsync());
    }
  }, [isAuthenticated, dispatch]);

  // Initialize from URL params only once
  const initialKeyword = searchParams.get("keyword") || "";
  const initialCategoryId = searchParams.get("categoryId")
    ? parseInt(searchParams.get("categoryId")!)
    : null;
  const initialSort = searchParams.get("sort") || "endTimeDesc";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [keyword, setKeyword] = useState(initialKeyword);
  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [showFilters, setShowFilters] = useState(false);

  // Sync with URL params when they change externally (e.g., from header search)
  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";
    const urlCategoryId = searchParams.get("categoryId")
      ? parseInt(searchParams.get("categoryId")!)
      : null;
    const urlSort = searchParams.get("sort") || "endTimeDesc";
    const urlPage = parseInt(searchParams.get("page") || "1");

    if (
      urlKeyword !== keyword ||
      urlCategoryId !== categoryId ||
      urlSort !== sort ||
      urlPage !== page
    ) {
      setKeyword(urlKeyword);
      setCategoryId(urlCategoryId);
      setSort(urlSort);
      setPage(urlPage);
    }
  }, [searchParams]);

  // Fetch products when filters change
  useEffect(() => {
    dispatch(
      searchProductsAsync({
        keyword: keyword || undefined,
        categoryId: categoryId || undefined,
        page,
        size: 20,
        sort,
      })
    );
  }, [keyword, categoryId, sort, page, dispatch]);

  const updateURL = (newKeyword: string, newCategoryId: number | null, newSort: string, newPage: number) => {
    const params: Record<string, string> = {};
    if (newKeyword) params.keyword = newKeyword;
    if (newCategoryId) params.categoryId = newCategoryId.toString();
    if (newSort && newSort !== "endTimeDesc") params.sort = newSort;
    if (newPage > 1) params.page = newPage.toString();

    setSearchParamsUrl(params, { replace: true });
  };

  const handleCategoryChange = (catId: number | null) => {
    const newPage = 1;
    setCategoryId(catId);
    setPage(newPage);
    updateURL(keyword, catId, sort, newPage);
  };

  const handleSortChange = (newSort: string) => {
    const newPage = 1;
    setSort(newSort);
    setPage(newPage);
    updateURL(keyword, categoryId, newSort, newPage);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL(keyword, categoryId, sort, newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Auctions</h1>

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
        <ProductGrid
          products={products}
          isLoading={isLoading}
          watchlistIds={new Set(watchlistProductIds)}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPrevious || isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
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

