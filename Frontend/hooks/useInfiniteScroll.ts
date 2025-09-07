import { useState, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  pageSize?: number;
  threshold?: number;
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setData: (data: T[]) => void;
}

export function useInfiniteScroll<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
  const { pageSize = 20, threshold = 0.8 } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction(currentPage, pageSize);
      
      if (result.data.length > 0) {
        setData(prev => [...prev, ...result.data]);
        setCurrentPage(prev => prev + 1);
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar más datos');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [loading, hasMore, currentPage, pageSize, fetchFunction]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      setHasMore(true);
      
      const result = await fetchFunction(1, pageSize);
      setData(result.data);
      setHasMore(result.hasMore);
      
      if (result.data.length > 0) {
        setCurrentPage(2);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al refrescar');
    } finally {
      setLoading(false);
    }
  }, [pageSize, fetchFunction]);

  const handleSetData = useCallback((newData: T[]) => {
    setData(newData);
    setCurrentPage(1);
    setHasMore(newData.length >= pageSize);
  }, [pageSize]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    setData: handleSetData,
  };
}
