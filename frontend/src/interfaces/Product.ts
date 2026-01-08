import type Category from "./Category";

export interface ProductImage {
  id: number;
  url: string;
  isThumbnail: boolean;
  productId: number;
}

export interface SellerInfo {
  id: number;
  fullName: string | null;
  avatarUrl: string | null;
  ratingPercent: number | null;
}

export interface HighestBidderInfo {
  id: number;
  maskedName: string | null;
  avatarUrl: string | null;
  ratingPercent: number | null;
}

export interface Product {
  id: number;
  title: string;
  status: string;
  startPrice?: number | null;
  currentPrice?: number | null;
  buyNowPrice?: number | null;
  bidIncrement?: number | null;
  startTime?: string | null; // ISO string from backend
  endTime?: string | null; // ISO string from backend
  autoExtensionEnabled: boolean;
  description?: string | null;
  createdAt?: string | null; // ISO string from backend
  sellerId: number;
  sellerInfo?: SellerInfo | null;
  highestBidderInfo?: HighestBidderInfo | null;
  category?: Category | null;
  images?: ProductImage[];
  bidCount?: number; // For top products
}

export interface ProductImageRequest {
  url: string;
  isThumbnail: boolean;
}

export interface ProductRequest {
  id: number | null;
  title: string;
  status: string;
  startPrice: number | null;
  buyNowPrice?: number | null;
  bidIncrement: number | null;
  startTime?: Date | null; // ISO string
  endTime?: Date | null; // ISO string
  autoExtensionEnabled: boolean;
  sellerId: number;
  categoryId: number | null;
  subcategoryId?: number | null;
  description?: string;
  images?: ProductImageRequest[];
}
