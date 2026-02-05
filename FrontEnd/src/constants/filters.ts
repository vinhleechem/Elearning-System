/**
 * Filter Constants
 * Centralized filter options and mappings
 */

export const PRICE_RANGE = {
  MIN: 0,
  MAX: 5000000,
  DEFAULT: [0, 5000000] as [number, number],
} as const;

export const LEVEL_MAP: Record<string, string> = {
  "Sơ cấp": "BEGINNER",
  "Trung cấp": "INTERMEDIATE",
  "Chuyên gia": "ADVANCED",
} as const;

export const LEVEL_OPTIONS = [
  "Tất cả",
  "Sơ cấp",
  "Trung cấp",
  "Chuyên gia",
] as const;

export const RATING_OPTIONS = [5, 4, 3, 2, 1] as const;

export const SORT_OPTIONS = [
  { value: "relevance", label: "Liên quan nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price_low", label: "Giá thấp nhất" },
  { value: "price_high", label: "Giá cao nhất" },
  { value: "rating", label: "Đánh giá cao nhất" },
] as const;
