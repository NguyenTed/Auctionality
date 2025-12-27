import { useEffect } from "react";

import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchTopProductsAsync, selectTopProducts, selectProductLoading } from "../../features/product/productSlice";
const responsive = {
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

function formatRemainingTime(endTime: Date) {
  const now = Date.now();

  const diffMs = new Date(endTime).getTime() - now;

  if (diffMs <= 0) {
    return "Ended";
  }

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 3) {
    return `${new Date(endTime).toLocaleString()}`;
  }

  // if (days <= 3 && days > 1) {
  //   return `${days} days `;
  // }

  if (days >= 1) {
    return `${days} day${days > 1 ? "s" : ""} `;
  }

  if (hours >= 1) {
    return `${hours} hour${hours > 1 ? "s" : ""} `;
  }

  return `${minutes} minute${minutes > 1 ? "s" : ""} `;
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  const endingSoonProducts = useAppSelector(selectTopProducts);
  const isLoading = useAppSelector(selectProductLoading);

  useEffect(() => {
    dispatch(fetchTopProductsAsync("ENDING_SOON"));
  }, [dispatch]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }
  return (
    <div className="w-full min-h-screen">
      {/* Auction Ending Soon */}
      <div className="">
        <span className="font-semibold px-[200px]">Auction ending soon</span>
        <div className="">
          <Carousel
            responsive={responsive}
            infinite
            arrows
            draggable
            swipeable
            keyBoardControl
            containerClass="mt-4"
            itemClass="px-2"
          >
            {endingSoonProducts.map((product) => (
              <div key={product.id} className="flex flex-col gap-2">
                <img
                  src="https://assets.catawiki.com/image/cw_auction_large/plain/assets/catawiki/assets/2025/10/2/c/f/8/cf83a0e6-9204-4500-ac6e-b7fb2824a2c8.jpg"
                  alt={product.title}
                  className="rounded"
                />
                <span className="font-bold">{product.title}</span>
                <span className="text-[#919397] font-bold">
                  Ends in {formatRemainingTime(product.endTime!)}
                </span>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
}
