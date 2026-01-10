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
import { subscribeToProductPrice, subscribeToBidHistory } from "../../utils/sse";
import { bidService, type AutoBidConfig } from "../../features/bid/bidService";
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
import { isNewProduct } from "../../utils/dateUtils";

// Slideshow Timer Component
function SlideshowTimer({ interval, onNext }: { interval: number; onNext: () => void }) {
  useEffect(() => {
    const timer = setInterval(onNext, interval);
    return () => clearInterval(timer);
  }, [interval, onNext]);
  return null;
}

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
  const [autoBidConfig, setAutoBidConfig] = useState<AutoBidConfig | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);

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

  // Fetch auto-bid config for current user
  useEffect(() => {
    if (!product || !isAuthenticated || !user) {
      setAutoBidConfig(null);
      return;
    }

    bidService.getAutoBidConfig(product.id)
      .then(setAutoBidConfig)
      .catch(() => setAutoBidConfig(null));
  }, [product, isAuthenticated, user]);

  // SSE subscription for product price updates
  useEffect(() => {
    if (!product || !isAuthenticated || product.status !== "ACTIVE") {
      return;
    }

    const eventSource = subscribeToProductPrice(product.id, (newPrice, previousPrice) => {
      // Update product price in Redux store from backend real-time update
      dispatch(
        updateProductBid({
          productId: product.id,
          newPrice: newPrice,
          bidCount: product.bidCount || 0,
        })
      );
      
      // Show notification if price increased (but not if user just placed bid - that's handled separately)
      if (newPrice > (previousPrice || 0)) {
        // Only show notification if the price actually changed significantly
        // This prevents duplicate notifications when user places bid
        const priceDiff = newPrice - (previousPrice || 0);
        if (priceDiff > 0.01) { // Only notify for meaningful price changes
          success(`Price updated to ${formatPrice(newPrice)}`);
        }
      }
    });

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [product, isAuthenticated, dispatch, success]);

  // SSE subscription for bid history updates
  useEffect(() => {
    if (!product || !isAuthenticated || product.status !== "ACTIVE") {
      return;
    }

    const eventSource = subscribeToBidHistory(product.id, (histories) => {
      // Update bid history in Redux
      dispatch({
        type: 'bid/fetchBidHistoryAsync/fulfilled',
        payload: { productId: product.id, history: histories },
      });
    });

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [product, isAuthenticated, dispatch]);

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
        // Don't optimistically update price - wait for real-time update from backend
        // The price will be updated via SSE when autoBidEngine.recalculate() runs
        
        // Use the auto-bid config returned from the backend response
        if (result.payload?.autoBidConfig) {
          setAutoBidConfig(result.payload.autoBidConfig);
        } else if (user) {
          // Fallback: fetch it if not in response
          bidService.getAutoBidConfig(product.id)
            .then(setAutoBidConfig)
            .catch(() => setAutoBidConfig(null));
        }

        // Refresh product from backend to get latest state (bidCount, etc.)
        // Price will be updated via SSE
        dispatch(fetchProductByIdAsync(product.id));

        // Refresh bid history in background (non-blocking)
        dispatch(fetchBidHistoryAsync(product.id));

        setBidAmount("");
        success(`Bid of ${formatPrice(amount)} placed successfully! Your auto-bid configuration has been set.`);
      } else {
        const errorPayload = result.payload as { type?: string; message?: string };
        
        if (errorPayload?.type === 'BID_PENDING_APPROVAL') {
          // Show specific message based on error text
          const message = errorPayload.message || 'Your bid requires approval';
          if (message.includes('already been sent')) {
            error('Your bid approval request has already been sent. Please wait for seller approval.');
          } else {
            error('Your bid requires approval before being placed. A request has been sent to the seller.');
          }
        } else {
          const errorMessage = typeof errorPayload === 'string' 
            ? errorPayload 
            : errorPayload?.message || "Failed to place bid";
          error(errorMessage);
        }
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
            <div className="relative bg-white rounded-xl shadow-sm overflow-hidden">
              {/* New Badge */}
              {product.createdAt && isNewProduct(product.createdAt, 2) && (
                <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                  🆕 NEW
                </div>
              )}
              
              {/* Main Image Slideshow */}
              <div className="relative bg-gray-50 aspect-square flex items-center justify-center overflow-hidden group">
                {/* Slideshow Container */}
                <div className="relative w-full h-full">
                  {images.map((img, index) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt={`${product.title} ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-700 ${
                        index === selectedImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                      }`}
                    />
                  ))}
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
                          setIsSlideshowPlaying(false);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        aria-label="Previous image"
                      >
                        <ArrowBackIcon />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev + 1) % images.length);
                          setIsSlideshowPlaying(false);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 rotate-180"
                        aria-label="Next image"
                      >
                        <ArrowBackIcon />
                      </button>
                    </>
                  )}
                  
                  {/* Slideshow Controls */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSlideshowPlaying(!isSlideshowPlaying);
                        }}
                        className="px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={isSlideshowPlaying ? "Pause slideshow" : "Play slideshow"}
                      >
                        {isSlideshowPlaying ? "Pause" : "Play"}
                      </button>
                      <div className="px-3 py-1 bg-black/50 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        {selectedImageIndex + 1} / {images.length}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Watchlist Button - Floating */}
                <button
                  type="button"
                  onClick={handleToggleWatchlist}
                  className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              
              {/* Auto-advance slideshow */}
              {images.length > 1 && isSlideshowPlaying && (
                <SlideshowTimer
                  interval={3000}
                  onNext={() => {
                    setSelectedImageIndex((prev) => (prev + 1) % images.length);
                  }}
                />
              )}

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
                  (() => {
                    // Check if description contains HTML tags
                    const hasHtml = /<[a-z][\s\S]*>/i.test(product.description);
                    if (hasHtml) {
                      return (
                        <div
                          className="text-gray-700 leading-relaxed text-lg"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(product.description),
                          }}
                        />
                      );
                    } else {
                      return (
                        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                          {product.description}
                        </p>
                      );
                    }
                  })()
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
                <Link
                  to={`/users/${product.sellerId}/profile`}
                  className="flex items-center gap-4 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                >
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
                </Link>
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
                <Link
                  to={`/users/${product.highestBidderInfo.id}/profile?masked=true`}
                  className="flex items-center gap-4 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                >
                  {product.highestBidderInfo.avatarUrl ? (
                    <img
                      src={product.highestBidderInfo.avatarUrl}
                      alt={product.highestBidderInfo.maskedName || "Bidder"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <PersonIcon className="text-gray-400 text-2xl" />
                    </div>
                  )}
                 <div className="flex items-center justify-between flex-1">
                  {/* Left: bidder info */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {product.highestBidderInfo.maskedName || "Unknown Bidder"}
                    </p>

                    {product.highestBidderInfo.ratingPercent !== null && (
                      <div className="flex items-center gap-1 mt-1">
                        <StarIcon className="text-yellow-400 text-sm" />
                        <span className="text-sm font-medium text-gray-700">
                          {product.highestBidderInfo.ratingPercent.toFixed(1)}% positive
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: bid amount */}
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-green-600">
                      ${product.highestBidderInfo.bidAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Highest bid
                    </p>
                  </div>
                </div>
                </Link>
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

              {/* Auto-Bid Configuration (only visible to user who created it) */}
              {autoBidConfig && isAuthenticated && user && autoBidConfig.bidderId === user.id && (
                <div className="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <GavelIcon className="text-blue-600" fontSize="small" />
                    <h3 className="text-lg font-semibold text-blue-900">
                      Your Auto-Bid Configuration
                    </h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Maximum Bid: <span className="font-bold text-blue-900">{formatPrice(autoBidConfig.maxPrice)}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Your auto-bid will automatically place bids up to this maximum amount.
                  </p>
                </div>
              )}

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
