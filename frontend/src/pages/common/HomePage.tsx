/**
 * HomePage Component
 * Main landing page with hero section, featured auctions, and categories
 */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchTopProductsAsync,
  selectTopProductsEndingSoon,
  selectTopProductsMostBid,
  selectProductLoading,
} from "../../features/product/productSlice";
import { selectCategories } from "../../features/category/categorySlice";
import { selectIsAuthenticated } from "../../features/auth/authSlice";
import {
  fetchWatchlistAsync,
  selectWatchlistItems,
  selectWatchlistLoading,
} from "../../features/watchlist/watchlistSlice";
import ProductGrid from "../../components/ProductGrid";
import ProductCard from "../../components/ProductCard";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const carouselResponsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

export default function HomePage() {
  const dispatch = useAppDispatch();
  const endingSoonProducts = useAppSelector(selectTopProductsEndingSoon);
  const isLoading = useAppSelector(selectProductLoading);
  const categories = useAppSelector(selectCategories);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const watchlistItems = useAppSelector(selectWatchlistItems);
  const watchlistLoading = useAppSelector(selectWatchlistLoading);
  
  // Use refs to track if we've already initiated fetches (prevents infinite loops)
  const hasFetchedEndingSoon = useRef(false);
  const hasFetchedWatchlist = useRef(false);

  // Fetch ending soon products once on mount
  useEffect(() => {
    if (!hasFetchedEndingSoon.current && endingSoonProducts.length === 0 && !isLoading) {
      hasFetchedEndingSoon.current = true;
      dispatch(fetchTopProductsAsync("ENDING_SOON"));
    }
  }, [dispatch, endingSoonProducts.length, isLoading]);

  // Fetch watchlist once if authenticated
  useEffect(() => {
    if (isAuthenticated && !hasFetchedWatchlist.current && watchlistItems.length === 0 && !watchlistLoading) {
      hasFetchedWatchlist.current = true;
      dispatch(fetchWatchlistAsync());
    }
  }, [dispatch, isAuthenticated, watchlistItems.length, watchlistLoading]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-orange-600 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Unique Items at Auction
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Bid on rare collectibles, art, jewelry, and more
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Browse Auctions
              </Link>
              <Link
                to="/signup"
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-12 bg-white border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?categoryId=${category.id}`}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <span className="text-2xl">📦</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ending Soon Section */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Ending Soon</h2>
            <Link
              to="/products?sort=endTimeAsc"
              className="text-primary hover:text-primary/80 font-medium"
            >
              View all →
            </Link>
          </div>
          {isLoading ? (
            <ProductGrid products={[]} isLoading={true} />
          ) : endingSoonProducts.length > 0 ? (
            <div className="overflow-hidden">
              <Carousel
                responsive={carouselResponsive}
                infinite={endingSoonProducts.length > 4}
                arrows
                draggable
                swipeable
                keyBoardControl
                containerClass="pb-4"
                itemClass="px-2"
              >
                {endingSoonProducts.map((product) => (
                  <div key={product.id} className="h-full px-2">
                    <ProductCard product={product} />
                  </div>
                ))}
              </Carousel>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No auctions ending soon</p>
          )}
        </div>
      </section>

      {/* Most Bids Section */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Most Bids</h2>
            <Link
              to="/products?sort=bidCountDesc"
              className="text-primary hover:text-primary/80 font-medium"
            >
              View all →
            </Link>
          </div>
          <MostBidsSection />
        </div>
      </section>
    </div>
  );
}

function MostBidsSection() {
  const dispatch = useAppDispatch();
  const mostBidProducts = useAppSelector(selectTopProductsMostBid);
  const isLoading = useAppSelector(selectProductLoading);
  
  // Use ref to track if we've already initiated fetch (prevents infinite loops)
  const hasFetchedMostBid = useRef(false);

  // Fetch most bid products once on mount
  useEffect(() => {
    if (!hasFetchedMostBid.current && mostBidProducts.length === 0 && !isLoading) {
      hasFetchedMostBid.current = true;
      dispatch(fetchTopProductsAsync("MOST_BID"));
    }
  }, [dispatch, mostBidProducts.length, isLoading]);

  if (isLoading) {
    return <ProductGrid products={[]} isLoading={true} />;
  }

  if (mostBidProducts.length === 0) {
    return <p className="text-gray-500 text-center py-8">No products with bids</p>;
  }

  return (
    <div className="overflow-hidden">
      <Carousel
        responsive={carouselResponsive}
        infinite={mostBidProducts.length > 4}
        arrows
        draggable
        swipeable
        keyBoardControl
        containerClass="pb-4"
        itemClass="px-2"
      >
        {mostBidProducts.map((product) => (
          <div key={product.id} className="h-full px-2">
            <ProductCard product={product} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
