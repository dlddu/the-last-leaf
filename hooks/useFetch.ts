import { useState, useEffect } from 'react';
import type { PageStatus } from '@/lib/types';

interface UseFetchOptions<T> {
  /** Transform the JSON response before storing */
  transform?: (data: T) => T;
}

interface UseFetchResult<T> {
  data: T | null;
  status: PageStatus;
  error: string | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  setStatus: React.Dispatch<React.SetStateAction<PageStatus>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Custom hook for fetching data on mount with standardized loading/error states.
 */
export function useFetch<T>(
  url: string,
  options?: UseFetchOptions<T>,
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          if (!cancelled) {
            setStatus('error');
            setError(`HTTP ${response.status}`);
          }
          return;
        }

        const json: T = await response.json();
        if (!cancelled) {
          setData(options?.transform ? options.transform(json) : json);
          setStatus('idle');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setError('네트워크 오류가 발생했습니다.');
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, status, error, setData, setStatus, setError };
}
