// src/contexts/DataContext.tsx
"use client";

import { createContext, useContext, useCallback, useRef, ReactNode } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface DataCache {
  [key: string]: CacheEntry<unknown>;
}

interface FetchingPromises {
  [key: string]: Promise<unknown>;
}

interface DataContextType {
  fetchWithCache: <T>(
    key: string,
    fetcher: () => Promise<T>,
    cacheTime?: number
  ) => Promise<T>;
  clearCache: (key?: string) => void;
  invalidateCache: (key: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const IS_DEV = process.env.NODE_ENV === 'development';

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const cacheRef = useRef<DataCache>({});
  const fetchingRef = useRef<FetchingPromises>({});

  const fetchWithCache = useCallback(
    async <T,>(
      key: string,
      fetcher: () => Promise<T>,
      cacheTime: number = DEFAULT_CACHE_DURATION
    ): Promise<T> => {
      // Check cache
      const cached = cacheRef.current[key];
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        if (IS_DEV) console.log(`[Cache] Hit: ${key}`);
        return cached.data as T;
      }

      // Check if already fetching
      if (fetchingRef.current[key]) {
        if (IS_DEV) console.log(`[Cache] Waiting for existing fetch: ${key}`);
        return fetchingRef.current[key] as Promise<T>;
      }

      // Start fetching
      if (IS_DEV) console.log(`[Cache] Fetching: ${key}`);
      const fetchPromise = fetcher();
      fetchingRef.current[key] = fetchPromise;

      try {
        const data = await fetchPromise;
        
        // Store in cache
        cacheRef.current[key] = {
          data,
          timestamp: Date.now(),
        };

        if (IS_DEV) console.log(`[Cache] Stored: ${key}`);
        return data;
      } catch (error) {
        console.error(`[Cache] Fetch error for ${key}:`, error);
        throw error;
      } finally {
        delete fetchingRef.current[key];
      }
    },
    []
  );

  const clearCache = useCallback((key?: string) => {
    if (key) {
      delete cacheRef.current[key];
      if (IS_DEV) console.log(`[Cache] Cleared: ${key}`);
    } else {
      cacheRef.current = {};
      if (IS_DEV) console.log('[Cache] Cleared all');
    }
  }, []);

  const invalidateCache = useCallback((key: string) => {
    delete cacheRef.current[key];
    if (IS_DEV) console.log(`[Cache] Invalidated: ${key}`);
  }, []);

  return (
    <DataContext.Provider value={{ fetchWithCache, clearCache, invalidateCache }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataCache = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataCache must be used within DataProvider');
  }
  return context;
};
