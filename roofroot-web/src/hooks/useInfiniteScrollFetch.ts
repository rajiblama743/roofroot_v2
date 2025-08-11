import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface PaginationResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  totalPages?: number;
  // Backward compatibility fields
  listings?: T[];
  agencies?: T[];
}

export interface UseInfiniteScrollFetchOptions<T> {
  fetcher: (page: number, filters?: any) => Promise<PaginationResponse<T>>;
  initialPage?: number;
  limit?: number;
  filters?: any;
  deps?: any[];
  enabled?: boolean;
}

export interface UseInfiniteScrollFetchReturn<T> {
  items: T[];
  page: number;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  loadMore: () => void;
  reset: () => void;
  refresh: () => void;
  setFilters: (filters: any) => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteScrollFetch<T>({
  fetcher,
  initialPage = 1,
  limit = 20,
  filters = {},
  deps = [],
  enabled = true
}: UseInfiniteScrollFetchOptions<T>): UseInfiniteScrollFetchReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, deps);

  // Reset function to clear all data and start fresh
  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setIsLoading(false);
    setIsError(false);
    setError(null);
    setHasMore(true);
    setTotal(0);
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [initialPage]);

  // Set filters and reset pagination
  const setFilters = useCallback((newFilters: any) => {
    // Reset pagination when filters change
    reset();
    // Update filters in the next render cycle
    setTimeout(() => {
      setPage(initialPage);
    }, 0);
  }, [reset, initialPage]);

  // Load more items
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || !enabled) return;

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      setIsError(false);
      setError(null);

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const response = await fetcher(page, memoizedFilters);

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) return;

      // Handle both new format (items) and backward compatibility (listings/agencies)
      let responseItems: any[] = [];
      if (response.items && Array.isArray(response.items)) {
        responseItems = response.items;
      } else if (response.listings && Array.isArray(response.listings)) {
        responseItems = response.listings;
      } else if (response.agencies && Array.isArray(response.agencies)) {
        responseItems = response.agencies;
      }

      if (responseItems.length > 0 || response.total === 0) {
        setItems(prevItems => 
          page === initialPage ? responseItems : [...prevItems, ...responseItems]
        );
        setHasMore(response.hasMore);
        setTotal(response.total);
        setPage(prevPage => prevPage + 1);
      } else {
        throw new Error('Invalid response format or no items returned');
      }
    } catch (err: any) {
      // Don't set error if request was aborted
      if (abortControllerRef.current?.signal.aborted) return;

      console.error('Error loading more items:', err);
      setIsError(true);
      setError(err.message || 'Failed to load more items');
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [fetcher, page, memoizedFilters, hasMore, enabled, initialPage]);

  // Refresh function to reload current data
  const refresh = useCallback(async () => {
    reset();
    // Load first page after reset
    setTimeout(() => {
      loadMore();
    }, 0);
  }, [reset, loadMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin: '100px', // Start loading when sentinel is 100px from viewport
        threshold: 0.1
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, loadMore, enabled]);

  // Initial load - only one effect for this
  useEffect(() => {
    if (enabled && page === initialPage && items.length === 0 && !isLoading) {
      loadMore();
    }
  }, [enabled, initialPage, items.length, isLoading, loadMore]);

  // Cleanup on unmount or when dependencies change
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Reset when filters change
  useEffect(() => {
    reset();
  }, [memoizedFilters, reset]);

  return {
    items,
    page,
    isLoading,
    isError,
    error,
    hasMore,
    total,
    loadMore,
    reset,
    refresh,
    setFilters,
    sentinelRef
  };
}
