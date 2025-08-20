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
  keepPreviousData?: boolean; // New option to keep previous data during filter changes
}

export interface UseInfiniteScrollFetchReturn<T> {
  items: T[];
  page: number;
  isLoading: boolean;
  isInitialLoading: boolean; // true until first page resolves
  isFetchingMore: boolean; // true when loading additional pages
  isError: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  hasFetchedOnce: boolean; // true after first response (success or error)
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
  enabled = true,
  keepPreviousData = false
}: UseInfiniteScrollFetchOptions<T>): UseInfiniteScrollFetchReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Start with true for immediate skeleton display
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);
  const isInitialLoadRef = useRef(false);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, deps);

  // Reset function to clear all data and start fresh
  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setIsLoading(false);
    setIsInitialLoading(true); // Reset to true to show skeletons immediately
    setIsFetchingMore(false);
    setIsError(false);
    setError(null);
    setHasMore(true);
    setTotal(0);
    setHasFetchedOnce(false);
    isInitialLoadRef.current = false;
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [initialPage]);

  // Set filters and reset pagination
  const setFilters = useCallback((newFilters: any) => {
    // Reset pagination when filters change
    setPage(initialPage);
    // Trigger a reset to clear current data and start fresh
    reset();
  }, [initialPage, reset]);

  // Load more items
  const loadMore = useCallback(async () => {
    console.log('loadMore called', { isLoadingRef: isLoadingRef.current, enabled, page });
    if (isLoadingRef.current || !enabled) return;

    try {
      isLoadingRef.current = true;
      const isFirstPage = page === initialPage;
      console.log('Starting fetch', { isFirstPage, page, filters: memoizedFilters });
      
      // Set appropriate loading states
      if (isFirstPage) {
        setIsInitialLoading(true);
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      
      setIsError(false);
      setError(null);

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const response = await fetcher(page, memoizedFilters);
      console.log('Fetch response', response);

      // Check if request was aborted - safely check if abortControllerRef.current exists
      if (abortControllerRef.current && abortControllerRef.current.signal.aborted) return;

      // Handle both new format (items) and backward compatibility (listings/agencies)
      let responseItems: any[] = [];
      let responseTotal = 0;
      let responseHasMore = false;
      
      // Check if response has data wrapper (new backend format)
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        responseItems = response.data.items;
        responseTotal = response.data.total || 0;
        responseHasMore = response.data.hasMore || false;
      } else if (response.items && Array.isArray(response.items)) {
        responseItems = response.items;
        responseTotal = response.total || 0;
        responseHasMore = response.hasMore || false;
      } else if (response.listings && Array.isArray(response.listings)) {
        responseItems = response.listings;
        responseTotal = response.total || 0;
        responseHasMore = response.hasMore || false;
      } else if (response.agencies && Array.isArray(response.agencies)) {
        responseItems = response.agencies;
        responseTotal = response.total || 0;
        responseHasMore = response.hasMore || false;
      }

      console.log('Processed items', { responseItems: responseItems.length, total: responseTotal });

      if (responseItems.length > 0 || responseTotal === 0) {
        setItems(prevItems => 
          page === initialPage ? responseItems : [...prevItems, ...responseItems]
        );
        setHasMore(responseHasMore);
        setTotal(responseTotal);
        setPage(prevPage => prevPage + 1);
        
        // Mark that we've fetched at least once
        if (!hasFetchedOnce) {
          setHasFetchedOnce(true);
        }
      } else {
        throw new Error('Invalid response format or no items returned');
      }
    } catch (err: any) {
      // Don't set error if request was aborted - safely check if abortControllerRef.current exists
      if (abortControllerRef.current && abortControllerRef.current.signal.aborted) return;

      console.error('Error loading more items:', err);
      setIsError(true);
      setError(err.message || 'Failed to load more items');
      
      // Mark that we've fetched at least once (even on error)
      if (!hasFetchedOnce) {
        setHasFetchedOnce(true);
      }
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
      setIsInitialLoading(false); // Always set to false after first request completes
      setIsFetchingMore(false);
      console.log('Fetch completed, states reset');
    }
  }, [fetcher, page, memoizedFilters, enabled, initialPage, hasFetchedOnce]);

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
        if (entry.isIntersecting && hasMore && !isLoading && !isInitialLoading) {
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
  }, [hasMore, isLoading, isInitialLoading, loadMore, enabled]);

  // Initial load - trigger immediately on mount when enabled
  useEffect(() => {
    if (enabled && !isInitialLoadRef.current) {
      console.log('Initial load effect triggered');
      isInitialLoadRef.current = true;
      // Trigger first fetch immediately
      loadMore();
    }
  }, [enabled, loadMore]);

  // Cleanup on unmount or when dependencies change
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Reset when filters change - but only after initial load
  useEffect(() => {
    if (isInitialLoadRef.current) {
      // Reset when filters change, but don't interfere with initial load
      reset();
    }
  }, [memoizedFilters, reset]);

  return {
    items,
    page,
    isLoading,
    isInitialLoading,
    isFetchingMore,
    isError,
    error,
    hasMore,
    total,
    hasFetchedOnce,
    loadMore,
    reset,
    refresh,
    setFilters,
    sentinelRef
  };
}
