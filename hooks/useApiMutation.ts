import { useState, useCallback } from 'react';

type MutationStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseApiMutationOptions<TResponse> {
  /** Called after a successful mutation with the parsed response */
  onSuccess?: (data: TResponse) => void;
  /** Called when the mutation fails */
  onError?: (error: string) => void;
}

interface UseApiMutationResult<TBody, TResponse> {
  mutate: (url: string, method: string, body?: TBody) => Promise<TResponse | null>;
  status: MutationStatus;
  error: string | null;
  reset: () => void;
}

/**
 * Custom hook for performing API mutations (POST, PUT, DELETE) with
 * standardized status and error handling.
 */
export function useApiMutation<TBody = unknown, TResponse = unknown>(
  options?: UseApiMutationOptions<TResponse>,
): UseApiMutationResult<TBody, TResponse> {
  const [status, setStatus] = useState<MutationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const mutate = useCallback(
    async (url: string, method: string, body?: TBody): Promise<TResponse | null> => {
      setStatus('loading');
      setError(null);

      try {
        const init: RequestInit = {
          method,
          headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        };

        const response = await fetch(url, init);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const message = errorData?.error ?? `HTTP ${response.status}`;
          setStatus('error');
          setError(message);
          options?.onError?.(message);
          return null;
        }

        const data: TResponse = await response.json();
        setStatus('success');
        options?.onSuccess?.(data);
        return data;
      } catch {
        const message = '네트워크 오류가 발생했습니다.';
        setStatus('error');
        setError(message);
        options?.onError?.(message);
        return null;
      }
    },
    [options],
  );

  return { mutate, status, error, reset };
}
