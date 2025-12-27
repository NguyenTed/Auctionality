/**
 * ProductGrid Component
 * Displays products in a responsive grid layout
 */

import ProductCard from "./ProductCard";
import type { Product } from "../interfaces/Product";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onToggleWatchlist?: (productId: number) => void;
  watchlistIds?: Set<number>;
}

export default function ProductGrid({
  products,
  isLoading = false,
  onToggleWatchlist,
  watchlistIds,
}: ProductGridProps) {
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
          isInWatchlist={watchlistIds?.has(product.id)}
          onToggleWatchlist={onToggleWatchlist}
        />
      ))}
    </div>
  );
}

