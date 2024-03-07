import { useCallback } from 'react';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { CacheExpiry, IStorageValue, CACHE_DEFAULTS, keyInternal } from './cacheDefaults';

export const setValue = (
  key: string,
  value: any,
  chainId: number,
  expirationMinutes: number = CacheExpiry.ONE_WEEK,
): void => {
  if (typeof window !== 'undefined') {
    const val: IStorageValue = {
      v: value,
      e:
        expirationMinutes === CacheExpiry.NEVER
          ? CacheExpiry.NEVER
          : Date.now() + expirationMinutes * 60000,
    };
    localStorage.setItem(keyInternal(chainId, key), JSON.stringify(val));
  }
};

export const getValue = (key: string, chainId: number): any => {
  if (typeof window !== 'undefined') {
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
  }
};

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
  const { chainId } = useNetworkConfig();

  const set = useCallback(
    (key: string, value: any, expirationMinutes: number = CacheExpiry.ONE_WEEK) => {
      setValue(key, value, chainId, expirationMinutes);
    },
    [chainId],
  );

  const get = useCallback(
    (key: string) => {
      return getValue(key, chainId);
    },
    [chainId],
  );

  return { setValue: set, getValue: get };
};
