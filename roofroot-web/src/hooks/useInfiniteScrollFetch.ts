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
  isInitialLoading: boolean; // New: true only for first page request
  isFetchingMore: boolean; // New: true when loading additional pages
  isError: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  hasFetchedOnce: boolean; // New: true after first response (success or error)
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
  const [isInitialLoading, setIsInitialLoading] = useState(false); // New state
  const [isFetchingMore, setIsFetchingMore] = useState(false); // New state
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false); // New state
  
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingRef = useRef(false);
  const isInitialLoadRef = useRef(false); // Track if this is the first load

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, deps);

  // Reset function to clear all data and start fresh
  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setIsLoading(false);
    setIsInitialLoading(false);
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
      const isFirstPage = page === initialPage;
      
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
        
        // Mark that we've fetched at least once
        if (!hasFetchedOnce) {
          setHasFetchedOnce(true);
        }
      } else {
        throw new Error('Invalid response format or no items returned');
      }
    } catch (err: any) {
      // Don't set error if request was aborted
      if (abortControllerRef.current?.signal.aborted) return;

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
      setIsInitialLoading(false);
      setIsFetchingMore(false);
    }
  }, [fetcher, page, memoizedFilters, hasMore, enabled, initialPage, hasFetchedOnce]);

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

  // Initial load - only one effect for this
  useEffect(() => {
    if (enabled && page === initialPage && items.length === 0 && !isLoading && !isInitialLoading) {
      isInitialLoadRef.current = true;
      loadMore();
    }
  }, [enabled, initialPage, items.length, isLoading, isInitialLoading, loadMore]);

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
