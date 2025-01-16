import { KVNamespace } from '@cloudflare/workers-types';

export interface CachedData<T> {
  data: T;
  metadata: {
    fetched: number;
    firstFetched: number;
  };
}

export interface CacheConfig<T> {
  store: KVNamespace;
  key: string;
  fetch: () => Promise<T>;
  namespace: string;
  options: {
    cacheTimeSeconds: number;
    indexingDelaySeconds: number;
  };
}

export async function withCache<T>({
  store,
  key,
  fetch,
  namespace,
  options: { cacheTimeSeconds, indexingDelaySeconds },
}: CacheConfig<T>): Promise<T> {
  const nowSeconds = Math.floor(Date.now() / 1000);

  try {
    const cachedValue = (await store.get(key, 'json')) as CachedData<T> | null;

    // No cache exists - fetch and store
    if (!cachedValue) {
      console.log(`[${namespace}] No cache found for key "${key}", fetching fresh data`);
      const data = await fetch();
      await store.put(
        key,
        JSON.stringify({
          data,
          metadata: { fetched: nowSeconds, firstFetched: nowSeconds },
        }),
      );
      return data;
    }

    const insideIndexingBuffer =
      cachedValue.metadata.firstFetched + indexingDelaySeconds > nowSeconds;
    const lastFetchDuringBuffer =
      cachedValue.metadata.firstFetched + indexingDelaySeconds > cachedValue.metadata.fetched;
    const hasData = Array.isArray(cachedValue.data)
      ? cachedValue.data.length > 0
      : !!cachedValue.data;
    const isExpired = cachedValue.metadata.fetched + cacheTimeSeconds < nowSeconds;

    // inside buffer, no data: refetch
    if (insideIndexingBuffer && !hasData) {
      console.log(
        `[${namespace}] Inside indexing buffer with no data for key "${key}", refetching`,
      );
      const data = await fetch();
      await store.put(
        key,
        JSON.stringify({
          data,
          metadata: {
            fetched: nowSeconds,
            firstFetched: cachedValue.metadata.firstFetched,
          },
        }),
      );
      return data;
    }

    // inside buffer, have data: return cache
    if (insideIndexingBuffer && hasData) {
      console.log(`[${namespace}] Inside indexing buffer with data for key "${key}", using cache`);
      return cachedValue.data;
    }

    // outside buffer, no data, last fetch during buffer: refetch
    if (!insideIndexingBuffer && !hasData && lastFetchDuringBuffer) {
      console.log(
        `[${namespace}] Outside buffer, no data, last fetch during buffer for key "${key}", refetching`,
      );
      const data = await fetch();
      await store.put(
        key,
        JSON.stringify({
          data,
          metadata: {
            fetched: nowSeconds,
            firstFetched: cachedValue.metadata.firstFetched,
          },
        }),
      );
      return data;
    }

    // outside buffer, no data, last fetch after buffer, expired cache: refetch
    if (!insideIndexingBuffer && !hasData && !lastFetchDuringBuffer && isExpired) {
      console.log(
        `[${namespace}] Outside buffer, no data, expired cache for key "${key}", refetching`,
      );
      const data = await fetch();
      await store.put(
        key,
        JSON.stringify({
          data,
          metadata: {
            fetched: nowSeconds,
            firstFetched: cachedValue.metadata.firstFetched,
          },
        }),
      );
      return data;
    }

    // outside buffer, no data, last fetch after buffer, valid cache: return cache
    if (!insideIndexingBuffer && !hasData && !lastFetchDuringBuffer && !isExpired) {
      console.log(
        `[${namespace}] Outside buffer, no data, valid cache for key "${key}", using cache`,
      );
      return cachedValue.data;
    }

    // outside buffer, have data, expired cache: refresh
    if (!insideIndexingBuffer && hasData && isExpired) {
      console.log(
        `[${namespace}] Outside buffer, have data, expired cache for key "${key}", refetching`,
      );
      const data = await fetch();
      await store.put(
        key,
        JSON.stringify({
          data,
          metadata: {
            fetched: nowSeconds,
            firstFetched: cachedValue.metadata.firstFetched,
          },
        }),
      );
      return data;
    }

    // outside buffer, have data, valid cache: return cache
    if (!insideIndexingBuffer && hasData && !isExpired) {
      console.log(
        `[${namespace}] Outside buffer, have data, valid cache for key "${key}", using cache`,
      );
      return cachedValue.data;
    }

    throw new Error(
      `Unexpected cache state:\n
      key: ${key}\n
      hasData: ${hasData}\n
      isExpired: ${isExpired}\n
      insideIndexingBuffer: ${insideIndexingBuffer}\n
      lastFetchDuringBuffer: ${lastFetchDuringBuffer}`,
    );
  } catch (e) {
    console.error(`[${namespace}] Cache error:`, e);
    throw e; // Let caller handle the error
  }
}
