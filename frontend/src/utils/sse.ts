/**
 * SSE (Server-Sent Events) Utility
 * Handles SSE subscriptions for real-time updates
 */

import type { BidHistoryDto } from "../features/bid/bidService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

export const subscribeToProductPrice = (
  productId: number,
  onPriceUpdate: (newPrice: number, previousPrice: number) => void
): EventSource | null => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("No access token found");
    return null;
  }

  // EventSource doesn't support custom headers, so we pass token as query parameter
  const eventSource = new EventSource(
    `${API_URL}/api/bids/products/${productId}/price?token=${encodeURIComponent(token)}`
  );

  eventSource.addEventListener("product-price-update", (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      onPriceUpdate(data.newPrice, data.previousPrice);
    } catch (error) {
      console.error("Error parsing price update:", error);
    }
  });

  eventSource.onerror = (error) => {
    console.error("SSE error for product price:", error);
    eventSource.close();
  };

  return eventSource;
};

export const subscribeToBidHistory = (
  productId: number,
  onBidHistoryUpdate: (histories: BidHistoryDto[]) => void
): EventSource | null => {
  const token = localStorage.getItem("accessToken");
  
  // Build URL with optional token (endpoint allows anonymous access)
  const url = token 
    ? `${API_URL}/api/bids/products/${productId}/history?token=${encodeURIComponent(token)}`
    : `${API_URL}/api/bids/products/${productId}/history`;

  const eventSource = new EventSource(url);

  eventSource.addEventListener("bid-history", (event: MessageEvent) => {
    try {
      const histories: BidHistoryDto[] = JSON.parse(event.data);
      onBidHistoryUpdate(histories);
    } catch (error) {
      console.error("Error parsing bid history:", error);
    }
  });

  eventSource.onerror = (error) => {
    console.error("SSE error for bid history:", error);
    // Don't close on first error - SSE may reconnect automatically
    // Only log the error for debugging
  };

  return eventSource;
};
