import { useState, useCallback } from "react";
import { getErrorMessage } from "../libs/utils";

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for handling async operations
 * Replaces repetitive loading/error state management
 */
export function useAsync<T = unknown>(
  asyncFunction: () => Promise<T>,
  options?: UseAsyncOptions<T>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, options]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { execute, loading, error, data, reset };
}

export default useAsync;
