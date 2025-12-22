import type Category from "./Category";

export interface Product {
  id: number;
  title: string;
  status: string;
  startPrice?: number | null;
  currentPrice?: number | null;
  buyNowPrice?: number | null;
  bidIncrement?: number | null;
  startTime?: Date | null;
  endTime?: Date | null;
  autoExtensionEnabled: boolean;
  sellerId: number;
  category?: Category | null;
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
}
