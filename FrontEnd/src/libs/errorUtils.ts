import { ApiError } from "../service/httpClient";

/**
 * Extract error message from unknown error types
 * @param error - Unknown error from try-catch
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  // 1. Custom ApiError (most specific)
  if (error instanceof ApiError) {
    return error.message;
  }

  // 2. Standard Error
  if (error instanceof Error) {
    return error.message;
  }

  // 3. Error-like objects with message property
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  // 4. String errors
  if (typeof error === "string") {
    return error;
  }

  // 5. Log unexpected format (dev only)
  if (import.meta.env.DEV) {
    console.error("Unexpected error format:", error);
  }

  // 6. Fallback
  return "Đã xảy ra lỗi không xác định, vui lòng thử lại.";
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.toLowerCase().includes("network") ||
      error.message.toLowerCase().includes("fetch")
    );
  }
  return false;
};

/**
 * Check if error is authentication related
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return error.statusCode === 401 || error.statusCode === 403;
  }
  return false;
};
