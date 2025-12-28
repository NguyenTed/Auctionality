/**
 * ProductDetailPage Component
 * Displays product details with bidding interface - Catawiki-inspired design
 */

import { useEffect, useState, useRef } from "react";
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
  selectWatchlistItems,
  selectWatchlistLoading,
} from "../../features/watchlist/watchlistSlice";
import {
  placeBidAsync,
  fetchBidHistoryAsync,
  selectBidHistory,
} from "../../features/bid/bidSlice";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GavelIcon from "@mui/icons-material/Gavel";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectCurrentProduct);
  const isLoading = useAppSelector(selectProductLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const watchlistItems = useAppSelector(selectWatchlistItems);
  const watchlistLoading = useAppSelector(selectWatchlistLoading);
  const isInWatchlist = useAppSelector(
    product ? selectIsInWatchlist(product.id) : () => false
  );
  const bidHistory = useAppSelector(
    product ? selectBidHistory(product.id) : () => []
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  
  // Use ref to track if we've already initiated watchlist fetch (prevents infinite loops)
  const hasFetchedWatchlist = useRef(false);

  useEffect(() => {
    if (id) {
      const productId = parseInt(id);
      dispatch(fetchProductByIdAsync(productId));
      dispatch(fetchBidHistoryAsync(productId));
      // Only fetch watchlist once if authenticated and not already loaded
      if (isAuthenticated && !hasFetchedWatchlist.current && watchlistItems.length === 0 && !watchlistLoading) {
        hasFetchedWatchlist.current = true;
        dispatch(fetchWatchlistAsync());
      }
    }
  }, [id, dispatch, isAuthenticated, watchlistItems.length, watchlistLoading]);

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

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!product || !bidAmount) return;

    const amount = Number(bidAmount);
    const minBid = (product.currentPrice || product.startPrice || 0) + (product.bidIncrement || 0);
    
    if (amount < minBid) {
      alert(`Minimum bid is ${minBid.toFixed(2)}`);
      return;
    }

    try {
      await dispatch(placeBidAsync({ productId: product.id, amount }));
      setBidAmount("");
      // Refresh product and bid history
      dispatch(fetchProductByIdAsync(product.id));
      dispatch(fetchBidHistoryAsync(product.id));
      alert("Bid placed successfully!");
    } catch (error) {
      console.error("Failed to place bid:", error);
    }
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              <ArrowBackIcon fontSize="small" />
              <span>Back</span>
            </button>
            <span className="text-gray-400">/</span>
            {product.category && (
              <>
                <Link
                  to={`/products?categoryId=${product.category.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {product.category.name}
                </Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-gray-900 font-medium line-clamp-1">{product.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Main Image */}
              <div className="relative bg-gray-50 aspect-square flex items-center justify-center">
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-full object-contain p-4"
                />
                {/* Watchlist Button - Floating */}
                <button
                  onClick={handleToggleWatchlist}
                  className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
                  aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {isInWatchlist ? (
                    <FavoriteIcon className="text-red-500" />
                  ) : (
                    <FavoriteBorderIcon className="text-gray-600" />
                  )}
                </button>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-primary shadow-md scale-105"
                            : "border-gray-200 hover:border-gray-300"
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
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <InfoIcon className="text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">Description</h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.title} - More details coming soon. This is a placeholder description.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Auction Info & Bidding */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Product Title & Category */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                  {product.title}
                </h1>
                {product.category && (
                  <Link
                    to={`/products?categoryId=${product.category.id}`}
                    className="inline-block text-sm text-primary hover:text-primary/80 font-medium mb-4"
                  >
                    {product.category.name}
                  </Link>
                )}
              </div>

              {/* Auction Status Card */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl shadow-sm p-6 border border-primary/20">
                {product.status === "ACTIVE" ? (
                  <>
                    {/* Current Bid */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">Current Bid</p>
                      <p className="text-4xl font-bold text-gray-900 mb-1">
                        {formatPrice(product.currentPrice || product.startPrice)}
                      </p>
                      {product.bidCount !== undefined && product.bidCount > 0 && (
                        <p className="text-sm text-gray-500">
                          {product.bidCount} bid{product.bidCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    {/* Time Remaining */}
                    <div className="bg-white/60 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <AccessTimeIcon className="text-orange-600" fontSize="small" />
                        <p className="text-sm font-semibold text-gray-700">Time Remaining</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatRemainingTime(product.endTime)}
                      </p>
                    </div>

                    {/* Buy Now Price */}
                    {product.buyNowPrice && (
                      <div className="mb-6 pb-6 border-b border-primary/20">
                        <p className="text-sm text-gray-600 mb-1">Buy Now Price</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(product.buyNowPrice)}
                        </p>
                      </div>
                    )}

                    {/* Bidding Section */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Enter Your Bid
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                              €
                            </span>
                            <input
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              placeholder={formatPrice(nextBidAmount).replace("€", "")}
                              min={nextBidAmount}
                              step={product.bidIncrement || 1}
                              className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-lg font-semibold"
                            />
                          </div>
                          <button
                            onClick={handlePlaceBid}
                            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                            disabled={!bidAmount || Number(bidAmount) < nextBidAmount}
                          >
                            Bid
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Minimum bid: <span className="font-semibold">{formatPrice(nextBidAmount)}</span>
                        </p>
                      </div>

                      {product.buyNowPrice && (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate("/login");
                              return;
                            }
                            // TODO: Implement buy now functionality
                            alert("Buy Now feature coming soon!");
                          }}
                          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <CheckCircleIcon />
                          Buy Now for {formatPrice(product.buyNowPrice)}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <GavelIcon className="text-gray-400 mx-auto mb-3" style={{ fontSize: 48 }} />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      {product.status === "ENDED" ? "Auction Ended" : "Auction Not Active"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.status === "ENDED"
                        ? "This auction has concluded"
                        : "This auction is currently unavailable"}
                    </p>
                  </div>
                )}
              </div>

              {/* Bid History */}
              {bidHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <GavelIcon className="text-primary" fontSize="small" />
                    <h3 className="text-lg font-bold text-gray-900">Bid History</h3>
                    <span className="ml-auto text-sm text-gray-500">({bidHistory.length})</span>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {bidHistory.slice(0, 10).map((bid, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{bid.bidderName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(bid.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <p className="font-bold text-primary text-lg ml-4">
                          {formatPrice(bid.amount)}
                        </p>
                      </div>
                    ))}
                    {bidHistory.length > 10 && (
                      <p className="text-sm text-gray-500 text-center pt-2">
                        +{bidHistory.length - 10} more bids
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Auction Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Auction Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Price</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(product.startPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bid Increment</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(product.bidIncrement)}
                    </span>
                  </div>
                  {product.startTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(product.startTime).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {product.endTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Time</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(product.endTime).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

