import { useCallback } from 'react';
import { useNetworkConfg } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { DecodedTransaction } from '../../types';

interface IndexedObject {
  [key: string]: any;
}
/**
 * The list of cache keys used in the app.
 *
 * To avoid weird caching bugs, hardcoding
 * keys should be avoided, always add the
 * cache key here.
 */
export enum DBCacheKeys {
  DECODED_TRANSACTIONS = 'DECODED_TRANSACTIONS',
}
/**
 * Useful defaults for cache expiration minutes.
 */
export enum CacheExpiry {
  NEVER = -1,
  ONE_HOUR = 60,
  ONE_DAY = ONE_HOUR * 24,
  ONE_WEEK = ONE_DAY * 7,
}

/**
 * Cache default values.
 *
 * Cache keys are not required to have a default value, but
 * note than without one the cache will return null until
 * a value is set.
 */
const CACHE_DEFAULTS: IndexedObject = {
  [DBCacheKeys.DECODED_TRANSACTIONS.toString()]: [] as DecodedTransaction[],
};

interface IStorageValue {
  // the value to store, 1 character to minimize cache size
  v: any;
  // the expiration, as a UTC timestamp
  e: number;
}

function keyInternal(chainId: number, key: string): string {
  return chainId + '_' + key;
}

// Helper function to create a promise-based wrapper for indexedDB
const withIndexedDB = (callback: (db: IDBDatabase) => Promise<any>) => {
  return new Promise((resolve, reject) => {
    // @note database version number must be an integer, not a float
    // @note database Version number muse be updated if the structure of the database changes
    const openRequest = indexedDB.open('fractal', 1);

    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;

      // Create an object store for each CacheKey
      for (const key in DBCacheKeys) {
        if (!db.objectStoreNames.contains(key)) {
          db.createObjectStore(key, { keyPath: 'key' });
        }
      }
    };

    openRequest.onsuccess = async () => {
      const db = openRequest.result;
      try {
        const result = await callback(db);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    openRequest.onerror = () => {
      reject(openRequest.error);
    };
  });
};
export const setIndexedDBValue = async (
  objectStoreName: string,
  key: string,
  value: any,
  chainId: number,
  expirationMinutes: number = CacheExpiry.ONE_WEEK
): Promise<void> => {
  const val: IStorageValue = {
    v: value,
    e:
      expirationMinutes === CacheExpiry.NEVER
        ? CacheExpiry.NEVER
        : Date.now() + expirationMinutes * 60000,
  };

  await withIndexedDB(async db => {
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);
    store.put({ key: keyInternal(chainId, key), value: val });
  });
};

export const getIndexedDBValue = async (
  storeKey: string,
  key: string,
  chainId: number
): Promise<any> => {
  return withIndexedDB(async db => {
    const transaction = db.transaction(storeKey, 'readonly');
    const store = transaction.objectStore(storeKey);
    const request = store.get(keyInternal(chainId, key));

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;

        if (result) {
          const parsed: IStorageValue = result.value;
          if (parsed.e === CacheExpiry.NEVER) {
            resolve(parsed.v);
          } else {
            if (parsed.e < Date.now()) {
              setIndexedDBValue(storeKey, key, null, chainId, CacheExpiry.NEVER);
              resolve(null);
            } else {
              resolve(parsed.v);
            }
          }
        } else if (CACHE_DEFAULTS[key]) {
          resolve(CACHE_DEFAULTS[key]);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  });
};

export const useIndexedDB = (objectStoreName: string) => {
  const { chainId } = useNetworkConfg();

  const set = useCallback(
    async (key: string, value: any, expirationMinutes: number = CacheExpiry.ONE_WEEK) => {
      await setIndexedDBValue(objectStoreName, key, value, chainId, expirationMinutes);
    },
    [chainId, objectStoreName]
  );

  const get = useCallback(
    async (key: string) => {
      return getIndexedDBValue(objectStoreName, key, chainId);
    },
    [chainId, objectStoreName]
  );

  return [set, get] as const;
};
