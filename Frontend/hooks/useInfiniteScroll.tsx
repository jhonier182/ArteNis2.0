import { useState, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  pageSize?: number;
  initialPage?: number;
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  currentPage: number;
  loadMore: () => void;
  refresh: () => void;
  setError: (error: string | null) => void;
}

export function useInfiniteScroll<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
  const { pageSize = 10, initialPage = 1 } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const isLoadingRef = useRef(false);

  const fetchData = useCallback(async (page: number, isRefresh = false) => {
    if (isLoadingRef.current) return;
    
    try { 
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction(page, pageSize);
      
      if (isRefresh) {
        setData(result.data);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(page);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [fetchFunction, pageSize]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !isLoadingRef.current) {
      fetchData(currentPage + 1);
    }
  }, [loading, hasMore, currentPage, fetchData]);

  const refresh = useCallback(() => {
    setData([]);
    setCurrentPage(initialPage);
    setHasMore(true);
    setError(null);
    fetchData(initialPage, true);
  }, [fetchData, initialPage]);

  return {
    data,
    loading,
    hasMore,
    error,
    currentPage,
    loadMore,
    refresh,
    setError,
  };
}
