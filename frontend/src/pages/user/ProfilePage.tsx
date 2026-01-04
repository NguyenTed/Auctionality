/**
 * ProfilePage Component
 * Displays user profile, watchlist, bids, and won products
 */

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectUser,
  selectIsAuthenticated,
} from "../../features/auth/authSlice";
import {
  fetchWatchlistAsync,
  selectWatchlistItems,
  selectWatchlistLoading,
  selectWatchlistProductIds,
} from "../../features/watchlist/watchlistSlice";
import { userService } from "../../features/user/userService";
import ProductGrid from "../../components/ProductGrid";
import EditProfileForm from "../../components/EditProfileForm";
import ChangePasswordForm from "../../components/ChangePasswordForm";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GavelIcon from "@mui/icons-material/Gavel";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarIcon from "@mui/icons-material/Star";
import SettingsIcon from "@mui/icons-material/Settings";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/Toast";
import type { Product } from "../../interfaces/Product";

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const watchlistItems = useAppSelector(selectWatchlistItems);
  const watchlistLoading = useAppSelector(selectWatchlistLoading);
  const watchlistProductIds = useAppSelector(selectWatchlistProductIds);

  const tabParam = searchParams.get("tab") as
    | "watchlist"
    | "bids"
    | "won"
    | "ratings"
    | "settings"
    | null;
  const [activeTab, setActiveTab] = useState<
    "watchlist" | "bids" | "won" | "ratings" | "settings"
  >(tabParam || "watchlist");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { toasts, success, error, removeToast } = useToast();
  const [bidsProducts, setBidsProducts] = useState<Product[]>([]);
  const [wonProducts, setWonProducts] = useState<Product[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Use refs to track if we've already initiated fetches (prevents infinite loops)
  const hasFetchedWatchlist = useRef(false);
  const hasLoadedUserData = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Only fetch watchlist once if not already loaded
    if (
      !hasFetchedWatchlist.current &&
      watchlistItems.length === 0 &&
      !watchlistLoading
    ) {
      hasFetchedWatchlist.current = true;
      dispatch(fetchWatchlistAsync());
    }

    // Only load user data once
    if (!hasLoadedUserData.current) {
      hasLoadedUserData.current = true;
      loadUserData();
    }
  }, [
    isAuthenticated,
    navigate,
    dispatch,
    watchlistItems.length,
    watchlistLoading,
  ]);

  const loadUserData = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const [bids, won, rates] = await Promise.all([
        userService.getAuctionProducts(),
        userService.getWonProducts(),
        userService.getRatings(),
      ]);
      setBidsProducts(bids);
      setWonProducts(won);
      setRatings(rates);
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const watchlistProducts = watchlistItems.map((item) => item.product);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img
                src={user.avatarUrl || "https://i.pravatar.cc/100"}
                alt={user.fullName || user.email}
                className="w-24 h-24 rounded-full border-2 border-primary"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.fullName || "User"}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                {user.ratingPercent !== undefined && (
                  <div className="flex items-center gap-1 mt-2">
                    <StarIcon className="text-yellow-400" fontSize="small" />
                    <span className="text-sm font-medium">
                      {user.ratingPercent}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/orders"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
              >
                <ShoppingBagIcon fontSize="small" />
                View Orders
              </Link>
              {user.roles &&
                !user.roles.some(
                  (role: string) => role === "SELLER" || role === "ROLE_SELLER"
                ) && (
                  <button
                    onClick={async () => {
                      try {
                        await userService.createSellerUpgradeRequest();
                        success(
                          "Seller upgrade request submitted successfully!"
                        );
                      } catch (err: any) {
                        const errorMessage =
                          err.response?.data?.error ||
                          "Failed to submit request";
                        error(errorMessage);
                      }
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <StorefrontIcon fontSize="small" />
                    Request Seller Upgrade
                  </button>
                )}
            </div>
          </div>
        </div>
        <ToastContainer toasts={toasts} onClose={removeToast} />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("watchlist")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "watchlist"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FavoriteIcon className="inline mr-2" fontSize="small" />
                Watchlist ({watchlistItems.length})
              </button>
              <button
                onClick={() => setActiveTab("bids")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "bids"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <GavelIcon className="inline mr-2" fontSize="small" />
                My Bids ({bidsProducts.length})
              </button>
              <button
                onClick={() => setActiveTab("won")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "won"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <EmojiEventsIcon className="inline mr-2" fontSize="small" />
                Won ({wonProducts.length})
              </button>
              <button
                onClick={() => setActiveTab("ratings")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "ratings"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <StarIcon className="inline mr-2" fontSize="small" />
                Ratings ({ratings.length})
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "settings"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <SettingsIcon className="inline mr-2" fontSize="small" />
                Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "watchlist" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  My Watchlist
                </h2>
                {watchlistLoading ? (
                  <ProductGrid products={[]} isLoading={true} />
                ) : watchlistProducts.length > 0 ? (
                  <ProductGrid
                    products={watchlistProducts}
                    watchlistIds={watchlistProductIds}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FavoriteIcon
                      className="mx-auto text-gray-300 mb-4"
                      style={{ fontSize: 64 }}
                    />
                    <p className="text-gray-500 text-lg">
                      Your watchlist is empty
                    </p>
                    <Link
                      to="/products"
                      className="mt-4 inline-block text-primary hover:text-primary/80 font-medium"
                    >
                      Browse auctions →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "bids" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Products I've Bid On
                </h2>
                {loading ? (
                  <ProductGrid products={[]} isLoading={true} />
                ) : bidsProducts.length > 0 ? (
                  <ProductGrid
                    products={bidsProducts}
                    watchlistIds={watchlistProductIds}
                  />
                ) : (
                  <div className="text-center py-12">
                    <GavelIcon
                      className="mx-auto text-gray-300 mb-4"
                      style={{ fontSize: 64 }}
                    />
                    <p className="text-gray-500 text-lg">
                      You haven't placed any bids yet
                    </p>
                    <Link
                      to="/products"
                      className="mt-4 inline-block text-primary hover:text-primary/80 font-medium"
                    >
                      Start bidding →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "won" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Products I've Won
                </h2>
                {loading ? (
                  <ProductGrid products={[]} isLoading={true} />
                ) : wonProducts.length > 0 ? (
                  <ProductGrid
                    products={wonProducts}
                    watchlistIds={watchlistProductIds}
                  />
                ) : (
                  <div className="text-center py-12">
                    <EmojiEventsIcon
                      className="mx-auto text-gray-300 mb-4"
                      style={{ fontSize: 64 }}
                    />
                    <p className="text-gray-500 text-lg">
                      You haven't won any auctions yet
                    </p>
                    <Link
                      to="/products"
                      className="mt-4 inline-block text-primary hover:text-primary/80 font-medium"
                    >
                      Browse auctions →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "ratings" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  My Ratings
                </h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : ratings.length > 0 ? (
                  <div className="space-y-4">
                    {ratings.map((rating) => (
                      <div
                        key={rating.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={
                                i < rating.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                              fontSize="small"
                            />
                          ))}
                          <span className="text-sm text-gray-500">
                            {rating.createdAt}
                          </span>
                        </div>
                        {rating.comment && (
                          <p className="text-gray-700">{rating.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <StarIcon
                      className="mx-auto text-gray-300 mb-4"
                      style={{ fontSize: 64 }}
                    />
                    <p className="text-gray-500 text-lg">No ratings yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Edit Profile
                  </h2>
                  {!showEditProfile ? (
                    <div>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Full Name</p>
                            <p className="font-medium">
                              {user.fullName || "Not set"}
                            </p>
                          </div>
                          {user.phoneNumber && (
                            <div>
                              <p className="text-sm text-gray-600">
                                Phone Number
                              </p>
                              <p className="font-medium">{user.phoneNumber}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowEditProfile(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium cursor-pointer"
                      >
                        Edit Profile
                      </button>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-6">
                      <EditProfileForm
                        user={user}
                        onCancel={() => setShowEditProfile(false)}
                        onSuccess={() => setShowEditProfile(false)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Change Password
                  </h2>
                  {!showChangePassword ? (
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer"
                    >
                      Change Password
                    </button>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-6">
                      <ChangePasswordForm
                        onCancel={() => setShowChangePassword(false)}
                        onSuccess={() => setShowChangePassword(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
