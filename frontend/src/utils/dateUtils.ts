/**
 * Date Utility Functions
 * Helper functions for date formatting and relative time calculations
 */

/**
 * Get relative time string (e.g., "in 3 days", "in 10 minutes")
 * For dates within 3 days, returns relative format
 * For dates beyond 3 days, returns standard date format
 */
export const getRelativeTime = (date: Date | string): string => {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // If more than 3 days away, return formatted date
  if (diffDays > 3) {
    return targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Within 3 days - return relative format
  if (diffDays > 0) {
    return `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  }

  if (diffHours > 0) {
    return `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  }

  if (diffMinutes > 0) {
    return `in ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  }

  // Past dates
  if (diffMinutes >= -1) {
    return "just now";
  }

  if (diffHours >= -1) {
    return `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? "s" : ""} ago`;
  }

  if (diffDays >= -1) {
    return `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? "s" : ""} ago`;
  }

  return targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Check if a product was created recently (within N minutes)
 */
export const isNewProduct = (createdAt: Date | string, minutes: number = 60): boolean => {
  const createdDate = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return diffMinutes <= minutes;
};
