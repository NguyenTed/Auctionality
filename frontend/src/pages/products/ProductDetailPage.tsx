/**
 * ProductDetailPage Component
 * Displays product details with bidding interface
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchProductByIdAsync,
  selectCurrentProduct,
  selectProductLoading,
} from "../../features/product/productSlice";
import { selectIsAuthenticated } from "../../features/auth/authSlice";
import {
  addToWatchlistAsync,
  removeFromWatchlistAsync,
  selectIsInWatchlist,
  fetchWatchlistAsync,
} from "../../features/watchlist/watchlistSlice";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectCurrentProduct);
  const isLoading = useAppSelector(selectProductLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInWatchlist = useAppSelector(
    product ? selectIsInWatchlist(product.id) : () => false
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchProductByIdAsync(parseInt(id)));
      if (isAuthenticated) {
        dispatch(fetchWatchlistAsync());
      }
    }
  }, [id, dispatch, isAuthenticated]);

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
      return `${days} day${days > 1 ? "s" : ""}, ${hours % 24} hour${hours % 24 !== 1 ? "s" : ""}`;
    }
    if (hours >= 1) {
      return `${hours} hour${hours > 1 ? "s" : ""}, ${minutes % 60} minute${minutes % 60 !== 1 ? "s" : ""}`;
    }
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  };

  const handlePlaceBid = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // TODO: Implement bid placement
    console.log("Place bid:", bidAmount);
  };

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!product) return;

    if (isInWatchlist) {
      await dispatch(removeFromWatchlistAsync(product.id));
    } else {
      await dispatch(addToWatchlistAsync(product.id));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Product not found</p>
          <Link to="/products" className="text-primary hover:text-primary/80">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const mainImage = images[selectedImageIndex]?.url || "https://via.placeholder.com/600x600?text=No+Image";
  const nextBidAmount = (product.currentPrice || product.startPrice || 0) + (product.bidIncrement || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowBackIcon fontSize="small" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden mb-4">
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-[500px] object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="bg-white rounded-lg p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                  {product.category && (
                    <Link
                      to={`/products?categoryId=${product.category.id}`}
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      {product.category.name}
                    </Link>
                  )}
                </div>
                <button
                  onClick={handleToggleWatchlist}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {isInWatchlist ? (
                    <FavoriteIcon className="text-red-500" />
                  ) : (
                    <FavoriteBorderIcon className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* Price and Time */}
              <div className="border-t border-b py-4 my-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Current Bid</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.currentPrice || product.startPrice)}
                  </span>
                </div>
                {product.buyNowPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Buy Now</span>
                    <span className="text-xl font-semibold text-primary">
                      {formatPrice(product.buyNowPrice)}
                    </span>
                  </div>
                )}
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {formatRemainingTime(product.endTime)}
                  </p>
                </div>
              </div>

              {/* Bid Section */}
              {product.status === "ACTIVE" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Bid
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={formatPrice(nextBidAmount)}
                        min={nextBidAmount}
                        step={product.bidIncrement || 1}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        onClick={handlePlaceBid}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                      >
                        Place Bid
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum bid: {formatPrice(nextBidAmount)}
                    </p>
                  </div>
                  {product.buyNowPrice && (
                    <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                      Buy Now for {formatPrice(product.buyNowPrice)}
                    </button>
                  )}
                </div>
              )}

              {product.status !== "ACTIVE" && (
                <div className="p-4 bg-gray-100 rounded-lg text-center">
                  <p className="text-gray-600 font-medium">
                    {product.status === "ENDED" ? "This auction has ended" : "This auction is not active"}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700">
                {product.title} - More details coming soon. This is a placeholder description.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

