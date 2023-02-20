import { useCallback, useEffect } from 'react';
import { useNetworkConfg } from '../../../NetworkConfig/NetworkConfigProvider';

export enum CacheKeys {
  FAVORITES = 'favorites',
  AUDIT_WARNING_SHOWN = 'audit_warning_shown',
  // name.eth -> 0x0 caching
  ENS_RESOLVE = 'ens_resolve_',
  // 0x0 -> name.eth caching
  ENS_LOOKUP = 'ens_lookup_',
}

/**
 * Maps Cached Values
 * @dev update this array to create a new cached item
 * these items are automatically mapped through and added to a user's localstorage on first vist
 */
const CACHE_DEFAULTS = [
  {
    key: CacheKeys.FAVORITES,
    defaultValue: {},
  },
  {
    key: CacheKeys.AUDIT_WARNING_SHOWN,
    defaultValue: true, // TODO never show, we may bring this back in the future...
  },
];

interface IStorageValue {
  value: any;
  expiration: number;
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

const KEY_PREFIX = 'fractal_';

export const useLocalStorage = () => {
  const { chainId } = useNetworkConfg();

  /**
   * Sets cache default values, if we have not already done so.
   */
  useEffect(() => {
    CACHE_DEFAULTS.forEach(({ key, defaultValue }) => {
      if (!localStorage.getItem(KEY_PREFIX + chainId + '_' + key)) {
        localStorage.setItem(KEY_PREFIX + chainId + '_' + key, JSON.stringify(defaultValue));
      }
    });
    return;
  }, [chainId]);

  const setValue = useCallback(
    (key: string, value: any, expirationMinutes: number = CacheExpiry.ONE_WEEK) => {
      const val: IStorageValue = {
        value: value,
        expiration:
          expirationMinutes === CacheExpiry.NEVER
            ? CacheExpiry.NEVER
            : Date.now() + expirationMinutes * 60000,
      };
      localStorage.setItem(KEY_PREFIX + chainId + '_' + key, JSON.stringify(val));
    },
    [chainId]
  );

  const getValue = useCallback(
    (key: string) => {
      const rawVal = localStorage.getItem(KEY_PREFIX + chainId + '_' + key);
      if (rawVal) {
        const parsed: IStorageValue = JSON.parse(rawVal);
        if (parsed.expiration === CacheExpiry.NEVER) {
          return parsed.value;
        } else {
          if (parsed.expiration < Date.now()) {
            localStorage.removeItem('fractal_' + chainId + '_' + key);
            return null;
          } else {
            return parsed.value;
          }
        }
      } else {
        return null;
      }
    },
    [chainId]
  );

  return { setValue, getValue };
};
