/**
 * ProductCard Component
 * Displays a product card in catawiki style
 */

import { Link } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import type { Product } from "../interfaces/Product";

interface ProductCardProps {
  product: Product;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (productId: number) => void;
}

export default function ProductCard({
  product,
  isInWatchlist = false,
  onToggleWatchlist,
}: ProductCardProps) {
  const formatPrice = (price: number | null | undefined) => {
    if (!price) return "€0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatRemainingTime = (endTime: string | null | undefined) => {
    if (!endTime) return "Ended";
    const now = Date.now();
    const diffMs = new Date(endTime).getTime() - now;

    if (diffMs <= 0) return "Ended";

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days >= 1) {
      return `${days} day${days > 1 ? "s" : ""}`;
    }
    if (hours >= 1) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  };

  const thumbnailImage =
    product.images?.find((img) => img.isThumbnail)?.url ||
    product.images?.[0]?.url ||
    "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      <Link to={`/products/${product.id}`} className="block flex-1 flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={thumbnailImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Watchlist button */}
          {onToggleWatchlist && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWatchlist(product.id);
              }}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
              aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isInWatchlist ? (
                <FavoriteIcon className="text-red-500" fontSize="small" />
              ) : (
                <FavoriteBorderIcon className="text-gray-600" fontSize="small" />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[3rem]">
            {product.title}
          </h3>

          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
          )}

          {/* Price and Time */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(product.currentPrice || product.startPrice)}
              </p>
              {product.bidCount !== undefined && (
                <p className="text-xs text-gray-500">{product.bidCount} bids</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-orange-600">
                {formatRemainingTime(product.endTime)}
              </p>
              <p className="text-xs text-gray-500">remaining</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

