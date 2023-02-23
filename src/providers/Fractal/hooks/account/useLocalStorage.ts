import { useCallback } from 'react';
import { useNetworkConfg } from '../../../NetworkConfig/NetworkConfigProvider';

/**
 * The list of cache keys used in the app.
 *
 * To avoid weird caching bugs, hardcoding
 * keys should be avoided, always add the
 * cache key here.
 */
export enum CacheKeys {
  FAVORITES = 'favorites',
  AUDIT_WARNING_SHOWN = 'audit_warning_shown',
  // name.eth -> 0x0 caching
  ENS_RESOLVE_PREFIX = 'ens_resolve_',
  DAO_NAME_PREFIX = 'dao_name_',

  // Safe API cache
  USD_BALANCES_PREFIX = 'safe_treasury_',
  COLLECTIBLES_PREFIX = 'safe_collectibles_',
  ALL_TRANSACTIONS_PREFIX = 'safe_all_transactions_',
  SAFE_INFO_PREFIX = 'safe_info_',
  ALL_TRANSFERS_PREFIX = 'safe_all_transfers_',
}

/**
 * The list of cache keys that pertain to a specific Safe.
 * This allows all Safe specific data from the Safe API
 * to be cleared at once, via clearSafeCache.
 */
const SAFE_KEYS: CacheKeys[] = [
  CacheKeys.USD_BALANCES_PREFIX,
  CacheKeys.COLLECTIBLES_PREFIX,
  CacheKeys.ALL_TRANSACTIONS_PREFIX,
  CacheKeys.SAFE_INFO_PREFIX,
  CacheKeys.ALL_TRANSFERS_PREFIX,
];

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
const CACHE_DEFAULTS = {
  [CacheKeys.FAVORITES.toString()]: Array<string>(),
  [CacheKeys.AUDIT_WARNING_SHOWN.toString()]: true,
};

interface IStorageValue {
  // the value to store, 1 character to minimize cache size
  v: any;
  // the expiration, as a UTC timestamp
  e: number;
}

function keyInternal(chainId: number, key: string): string {
  return 'fract_' + chainId + '_' + key;
}

/**
 * A hook which returns a getter and setter for local storage cache,
 * with an optional expiration (in minutes) param.
 *
 * Each value set/get is specific to the currently connected chainId.
 *
 * The default expiration is 1 week. Use CacheExpiry.NEVER to keep
 * the value cached indefinitely.
 *
 * All JSON parsing is done internally, you should only need to pass
 * the value, array, or object you would like to cache.
 */
export const useLocalStorage = () => {
  const { chainId } = useNetworkConfg();

  const setValue = useCallback(
    (key: string, value: any, expirationMinutes: number = CacheExpiry.ONE_WEEK) => {
      const val: IStorageValue = {
        v: value,
        e:
          expirationMinutes === CacheExpiry.NEVER
            ? CacheExpiry.NEVER
            : Date.now() + expirationMinutes * 60000,
      };
      localStorage.setItem(keyInternal(chainId, key), JSON.stringify(val));
    },
    [chainId]
  );

  const getValue = useCallback(
    (key: string) => {
      const rawVal = localStorage.getItem(keyInternal(chainId, key));
      if (rawVal) {
        const parsed: IStorageValue = JSON.parse(rawVal);
        if (parsed.e === CacheExpiry.NEVER) {
          return parsed.v;
        } else {
          if (parsed.e < Date.now()) {
            localStorage.removeItem(keyInternal(chainId, key));
            return null;
          } else {
            return parsed.v;
          }
        }
      } else if (CACHE_DEFAULTS[key]) {
        return CACHE_DEFAULTS[key];
      } else {
        return null;
      }
    },
    [chainId]
  );

  const clearCacheKey = useCallback(
    (key: string) => {
      localStorage.removeItem(keyInternal(chainId, key));
    },
    [chainId]
  );

  const clearSafeCache = useCallback(
    (address?: string) => {
      if (!address) return;

      SAFE_KEYS.forEach(key => {
        localStorage.removeItem(keyInternal(chainId, key + address));
      });
    },
    [chainId]
  );

  return { setValue, getValue, clearCacheKey, clearSafeCache };
};
