/**
 * ProductGrid Component
 * Displays products in a responsive grid layout
 */

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import {
  addToWatchlistAsync,
  removeFromWatchlistAsync,
} from "../features/watchlist/watchlistSlice";
import ProductCard from "./ProductCard";
import type { Product } from "../interfaces/Product";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onToggleWatchlist?: (productId: number) => void;
  watchlistIds?: number[];
  highestBidderIds?: number[]; // Array of product IDs where current user is highest bidder
}

export default function ProductGrid({
  products,
  isLoading = false,
  onToggleWatchlist,
  watchlistIds,
  highestBidderIds
}: ProductGridProps) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const watchlistProductIds = useAppSelector((state) => state.watchlist.productIds);

  const handleToggleWatchlist = async (productId: number) => {
    if (!isAuthenticated) return;

    const isInWatchlist = watchlistProductIds.includes(productId);
    if (isInWatchlist) {
      await dispatch(removeFromWatchlistAsync(productId));
    } else {
      await dispatch(addToWatchlistAsync(productId));
    }
  };

  const getIsInWatchlist = (productId: number) => {
    if (watchlistIds) {
      return watchlistIds.includes(productId);
    }
    return watchlistProductIds.includes(productId);
  };
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isInWatchlist={onToggleWatchlist ? getIsInWatchlist(product.id) : false}
          onToggleWatchlist={onToggleWatchlist || (isAuthenticated ? handleToggleWatchlist : undefined)}
          isHighestBidder={highestBidderIds?.includes(product.id) || false}
        />
      ))}
    </div>
  );
}

