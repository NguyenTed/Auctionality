/**
 * ProductDetailPage Component
 * Displays product details with bidding interface - Catawiki-inspired design
 * Modern, classy, and optimized for great UX
 */

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchProductByIdAsync,
  fetchRelatedProductsAsync,
  selectCurrentProduct,
  selectRelatedProducts,
  selectProductLoading,
  updateProductBid,
} from "../../features/product/productSlice";
import { selectIsAuthenticated } from "../../features/auth/authSlice";
import {
  addToWatchlistAsync,
  removeFromWatchlistAsync,
  selectIsInWatchlist,
  fetchWatchlistAsync,
  selectWatchlistLoading,
} from "../../features/watchlist/watchlistSlice";
import {
  placeBidAsync,
  fetchBidHistoryAsync,
  selectBidHistory,
  selectBidLoading,
} from "../../features/bid/bidSlice";
import { buyNowAsync, selectBuyingNow } from "../../features/order/orderSlice";
import { orderService, type OrderDto } from "../../features/order/orderService";
import { selectUser } from "../../features/auth/authSlice";
import { connectWebSocket, subscribeToAuctionEnd } from "../../utils/websocket";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GavelIcon from "@mui/icons-material/Gavel";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import PaymentIcon from "@mui/icons-material/Payment";
import CountdownClock from "../../components/CountdownClock";
import ProductCard from "../../components/ProductCard";
import QASection from "../../components/QASection";
import ExtraDescriptionSection from "../../components/ExtraDescriptionSection";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import DOMPurify from "dompurify";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectCurrentProduct);
  const relatedProducts = useAppSelector(selectRelatedProducts);
  const isLoading = useAppSelector(selectProductLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const watchlistLoading = useAppSelector(selectWatchlistLoading);
  const bidLoading = useAppSelector(selectBidLoading);
  const isInWatchlist = useAppSelector(
    product ? selectIsInWatchlist(product.id) : () => false
  );
  const bidHistory = useAppSelector(
    product ? selectBidHistory(product.id) : () => []
  );
  const buyingNow = useAppSelector(
    product ? selectBuyingNow(product.id) : () => false
  );
  const user = useAppSelector(selectUser);
  const { toasts, success, error, removeToast } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [order, setOrder] = useState<OrderDto | null>(null);

  // Use ref to track if we've already initiated watchlist fetch (prevents infinite loops)
  const hasFetchedWatchlist = useRef(false);

  // Fetch product, bid history, and related products when id changes
  useEffect(() => {
    if (id) {
      const productId = parseInt(id);
      dispatch(fetchProductByIdAsync(productId));
      dispatch(fetchBidHistoryAsync(productId));
    }
  }, [id, dispatch]);

  // Fetch related products when product is loaded
  useEffect(() => {
    if (product?.category?.id) {
      dispatch(fetchRelatedProductsAsync(product.id));
    }
  }, [product?.id, product?.category?.id, dispatch]);

  // Fetch watchlist once on mount if authenticated (separate effect to avoid re-running)
  useEffect(() => {
    if (isAuthenticated && !hasFetchedWatchlist.current) {
      hasFetchedWatchlist.current = true;
      dispatch(fetchWatchlistAsync());
    }
  }, [isAuthenticated, dispatch]);

  // Fetch order if auction ended and user is authenticated
  useEffect(() => {
    const fetchOrder = async () => {
      if (
        product &&
        product.status === "ENDED" &&
        isAuthenticated &&
        user &&
        product.id
      ) {
        try {
          const fetchedOrder = await orderService.getOrderByProductId(
            product.id
          );
          setOrder(fetchedOrder);
        } catch {
          // Order not found or user not authorized - that's okay
          setOrder(null);
        }
      } else {
        setOrder(null);
      }
    };

    fetchOrder();
  }, [product, isAuthenticated, user]);

  // WebSocket subscription for auction end notifications
  useEffect(() => {
    if (!product || !isAuthenticated || product.status !== "ACTIVE" || !user) {
      return;
    }

    let subscription: ReturnType<typeof subscribeToAuctionEnd> | null = null;

    const setupWebSocket = () => {
      connectWebSocket(
        () => {
          // Connected - subscribe to auction end
          subscription = subscribeToAuctionEnd(product.id, (notification) => {
            // Refresh product data
            if (id) {
              dispatch(fetchProductByIdAsync(parseInt(id)));
            }
            // Show notification
            if (notification.buyerId === user.id) {
              success("Auction ended! You won! Please complete your order.");
            }
          });
        },
        (err) => {
          console.error("WebSocket connection error:", err);
        }
      );
    };

    setupWebSocket();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [product, isAuthenticated, user, id, dispatch, success]);

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return "€0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      error("Please log in to place a bid");
      navigate("/login");
      return;
    }
    if (!product || !bidAmount) return;

    const amount = Number(bidAmount);
    const minBid =
      (product.currentPrice || product.startPrice || 0) +
      (product.bidIncrement || 0);

    if (amount < minBid) {
      error(`Minimum bid is ${formatPrice(minBid)}`);
      return;
    }

    setIsPlacingBid(true);
    try {
      const result = await dispatch(
        placeBidAsync({ productId: product.id, amount })
      );

      if (placeBidAsync.fulfilled.match(result)) {
        // Optimistically update product state
        dispatch(
          updateProductBid({
            productId: product.id,
            newPrice: amount,
            bidCount: (product.bidCount || 0) + 1,
          })
        );

        // Refresh bid history in background (non-blocking)
        dispatch(fetchBidHistoryAsync(product.id));

        setBidAmount("");
        success(`Bid of ${formatPrice(amount)} placed successfully!`);
      } else {
        const errorMessage =
          (result.payload as string) || "Failed to place bid";
        error(errorMessage);
      }
    } catch (err) {
      error("An unexpected error occurred. Please try again.");
      console.error("Failed to place bid:", err);
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleToggleWatchlist = async (e?: React.MouseEvent) => {
    // Prevent any default behavior or event propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      error("Please log in to add items to your watchlist");
      navigate("/login");
      return;
    }
    if (!product) return;

    try {
      if (isInWatchlist) {
        const result = await dispatch(removeFromWatchlistAsync(product.id));
        if (removeFromWatchlistAsync.fulfilled.match(result)) {
          success("Removed from watchlist");
        } else {
          error(
            (result.payload as string) || "Failed to remove from watchlist"
          );
        }
      } else {
        const result = await dispatch(addToWatchlistAsync(product.id));
        if (addToWatchlistAsync.fulfilled.match(result)) {
          success("Added to watchlist");
        } else {
          error((result.payload as string) || "Failed to add to watchlist");
        }
      }
    } catch (err) {
      error("An unexpected error occurred");
      console.error("Failed to toggle watchlist:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Product not found</p>
          <Link
            to="/products"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const mainImage =
    images[selectedImageIndex]?.url ||
    "https://via.placeholder.com/600x600?text=No+Image";
  const nextBidAmount =
    (product.currentPrice || product.startPrice || 0) +
    (product.bidIncrement || 0);
  const isActive = product.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowBackIcon fontSize="small" />
              <span>Back</span>
            </button>
            <span className="text-gray-400">/</span>
            {product.category && (
              <>
                <Link
                  to={`/products?categoryId=${product.category.id}`}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  {product.category.name}
                </Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-gray-900 font-medium line-clamp-1">
              {product.title}
            </span>
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
                  type="button"
                  onClick={handleToggleWatchlist}
                  className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={
                    isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
                  }
                  disabled={watchlistLoading}
                >
                  {watchlistLoading ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : isInWatchlist ? (
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
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
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
                <h2 className="text-2xl font-bold text-gray-900">
                  Description
                </h2>
              </div>
              <div className="prose max-w-none">
                {product.description ? (
                  <div
                    className="text-gray-700 leading-relaxed text-lg"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                  />
                ) : (
                  <p className="text-gray-500 italic">
                    No description available for this product.
                  </p>
                )}
              </div>
            </div>

            {/* Seller Info Section */}
            {product.sellerInfo && (
              <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PersonIcon className="text-primary" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Seller Information
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  {product.sellerInfo.avatarUrl ? (
                    <img
                      src={product.sellerInfo.avatarUrl}
                      alt={product.sellerInfo.fullName || "Seller"}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <PersonIcon className="text-gray-400 text-3xl" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {product.sellerInfo.fullName || "Unknown Seller"}
                    </p>
                    {product.sellerInfo.ratingPercent !== null && (
                      <div className="flex items-center gap-1 mt-1">
                        <StarIcon className="text-yellow-400 text-sm" />
                        <span className="text-sm font-medium text-gray-700">
                          {product.sellerInfo.ratingPercent.toFixed(1)}%
                          positive
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Highest Bidder Info Section */}
            {product.highestBidderInfo && (
              <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GavelIcon className="text-primary" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Current Highest Bidder
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  {product.highestBidderInfo.avatarUrl ? (
                    <img
                      src={product.highestBidderInfo.avatarUrl}
                      alt={product.highestBidderInfo.fullName || "Bidder"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <PersonIcon className="text-gray-400 text-2xl" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {product.highestBidderInfo.fullName || "Unknown Bidder"}
                    </p>
                    {product.highestBidderInfo.ratingPercent !== null && (
                      <div className="flex items-center gap-1 mt-1">
                        <StarIcon className="text-yellow-400 text-sm" />
                        <span className="text-sm font-medium text-gray-700">
                          {product.highestBidderInfo.ratingPercent.toFixed(1)}%
                          positive
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <InfoIcon className="text-primary" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Related Products
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard
                      key={relatedProduct.id}
                      product={relatedProduct}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Q&A Section */}
            {/* Extra Description Section */}
            <ExtraDescriptionSection
              productId={product.id}
              isSeller={user?.id === product.sellerId}
            />

            <QASection productId={product.id} sellerId={product.sellerId} />
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
                    className="inline-block text-sm text-primary hover:text-primary/80 font-medium mb-4 cursor-pointer"
                  >
                    {product.category.name}
                  </Link>
                )}
              </div>

              {/* Auction Status Card */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl shadow-sm p-6 border border-primary/20">
                {isActive ? (
                  <>
                    {/* Current Bid */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">Current Bid</p>
                      <p className="text-4xl font-bold text-gray-900 mb-1">
                        {formatPrice(
                          product.currentPrice || product.startPrice
                        )}
                      </p>
                      {product.bidCount !== undefined &&
                        product.bidCount > 0 && (
                          <p className="text-sm text-gray-500">
                            {product.bidCount} bid
                            {product.bidCount !== 1 ? "s" : ""}
                          </p>
                        )}
                    </div>

                    {/* Countdown Clock */}
                    <div className="bg-white/60 rounded-lg p-4 mb-6">
                      <CountdownClock endTime={product.endTime} />
                    </div>

                    {/* Buy Now Price */}
                    {product.buyNowPrice && (
                      <div className="mb-6 pb-6 border-b border-primary/20">
                        <p className="text-sm text-gray-600 mb-1">
                          Buy Now Price
                        </p>
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
                              placeholder={formatPrice(nextBidAmount).replace(
                                "€",
                                ""
                              )}
                              min={nextBidAmount}
                              step={product.bidIncrement || 1}
                              className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-lg font-semibold"
                              disabled={isPlacingBid || bidLoading}
                            />
                          </div>
                          <button
                            onClick={handlePlaceBid}
                            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md cursor-pointer"
                            disabled={
                              !bidAmount ||
                              Number(bidAmount) < nextBidAmount ||
                              isPlacingBid ||
                              bidLoading
                            }
                          >
                            {isPlacingBid || bidLoading ? "Placing..." : "Bid"}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Minimum bid:{" "}
                          <span className="font-semibold">
                            {formatPrice(nextBidAmount)}
                          </span>
                        </p>
                      </div>

                      {product.buyNowPrice && (
                        <button
                          onClick={async () => {
                            if (!isAuthenticated) {
                              error("Please log in to buy now");
                              navigate("/login");
                              return;
                            }
                            if (!product) return;

                            try {
                              const result = await dispatch(
                                buyNowAsync(product.id)
                              );
                              if (buyNowAsync.fulfilled.match(result)) {
                                success(
                                  `Product purchased successfully! Order #${result.payload.order.id} created.`
                                );
                                // Refresh product to show updated status
                                dispatch(fetchProductByIdAsync(product.id));
                                // Navigate to orders page or show order details
                                navigate(`/profile?tab=won`);
                              } else {
                                const errorMessage =
                                  (result.payload as string) ||
                                  "Failed to purchase product";
                                error(errorMessage);
                              }
                            } catch (err) {
                              error(
                                "An unexpected error occurred. Please try again."
                              );
                              console.error("Failed to buy now:", err);
                            }
                          }}
                          disabled={buyingNow || bidLoading}
                          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {buyingNow ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon />
                              Buy Now for {formatPrice(product.buyNowPrice)}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <GavelIcon
                      className="text-gray-400 mx-auto mb-3"
                      style={{ fontSize: 48 }}
                    />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      {product.status === "ENDED"
                        ? "Auction Ended"
                        : "Auction Not Active"}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {product.status === "ENDED"
                        ? "This auction has concluded"
                        : "This auction is currently unavailable"}
                    </p>
                    {/* Show Complete Order button if user is winner */}
                    {product.status === "ENDED" &&
                      order &&
                      user &&
                      order.buyer.id === user.id && (
                        <Link
                          to={`/orders/${order.id}/complete`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                        >
                          <PaymentIcon />
                          Complete Order
                        </Link>
                      )}
                    {product.status === "ENDED" &&
                      order &&
                      user &&
                      order.seller.id === user.id && (
                        <Link
                          to={`/orders/${order.id}/complete`}
                          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          View Order
                        </Link>
                      )}
                  </div>
                )}
              </div>

              {/* Bid History */}
              {bidHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <GavelIcon className="text-primary" fontSize="small" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Bid History
                    </h3>
                    <span className="ml-auto text-sm text-gray-500">
                      ({bidHistory.length})
                    </span>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {bidHistory.slice(0, 10).map((bid, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {bid.bidderName}
                          </p>
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
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Auction Details
                </h3>
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
