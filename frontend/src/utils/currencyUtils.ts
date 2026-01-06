/**
 * Currency Conversion Utilities
 * Handles USD to VND conversion for payment display
 */

// Default exchange rate: 1 USD = 24,000 VND
// This can be made configurable via environment variable
const DEFAULT_USD_TO_VND_RATE = 24000;

/**
 * Convert USD amount to VND
 * @param usdAmount Amount in USD
 * @param exchangeRate Optional exchange rate (defaults to 24,000)
 * @returns Amount in VND
 */
export const convertUSDToVND = (
  usdAmount: number,
  exchangeRate: number = DEFAULT_USD_TO_VND_RATE
): number => {
  return Math.round(usdAmount * exchangeRate);
};

/**
 * Format VND amount with Vietnamese currency format
 * @param vndAmount Amount in VND
 * @returns Formatted string (e.g., "1,000,000 ₫")
 */
export const formatVND = (vndAmount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(vndAmount);
};

/**
 * Format USD amount
 * @param usdAmount Amount in USD
 * @returns Formatted string (e.g., "$1,000.00")
 */
export const formatUSD = (usdAmount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdAmount);
};

