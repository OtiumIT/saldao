import { useState, useCallback } from 'react';
import { apiClient, ApiClientError } from '../lib/api-client';

interface UseApiOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useApi<TData = unknown, TPayload = unknown>() {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<TData>,
      options?: UseApiOptions
    ): Promise<TData | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        setData(result);
        options?.onSuccess?.();
        return result;
      } catch (err) {
        const apiError =
          err instanceof ApiClientError
            ? err
            : err instanceof Error
            ? err
            : new Error('An unknown error occurred');
        setError(apiError);
        options?.onError?.(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
