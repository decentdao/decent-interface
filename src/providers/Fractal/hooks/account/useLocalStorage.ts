import { useCallback, useEffect } from 'react';
import { useNetworkConfg } from '../../../NetworkConfig/NetworkConfigProvider';

export enum CacheKeys {
  FAVORITES = 'favorites',
  AUDIT = 'not_audited_acceptance',
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
    key: CacheKeys.AUDIT,
    defaultValue: true, // TODO set audit prompt to hide by default. We may bring this back in the future...
  },
];

interface IStorageValue {
  value: any;
  expiration?: number;
}

export const useLocalStorage = () => {
  const { chainId } = useNetworkConfg();

  /**
   * Sets cache default values, if we have not already done so.
   */
  useEffect(() => {
    CACHE_DEFAULTS.forEach(({ key, defaultValue }) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
      }
    });
    return;
  }, []);

  const setValue = useCallback(
    (key: string, value: any, expirationMinutes?: number) => {
      const val: IStorageValue = {
        value: value,
        expiration: expirationMinutes ? Date.now() + expirationMinutes * 60000 : undefined,
      };
      localStorage.setItem('fractal_' + chainId + '_' + key, JSON.stringify(val));
    },
    [chainId]
  );

  const getValue = useCallback(
    (key: string) => {
      const rawVal = localStorage.getItem('fractal_' + chainId + '_' + key);
      if (rawVal) {
        const parsed: IStorageValue = JSON.parse(rawVal);
        if (parsed.expiration) {
          if (parsed.expiration < Date.now()) {
            localStorage.removeItem('fractal_' + chainId + '_' + key);
            return null;
          } else {
            return parsed.value;
          }
        } else {
          return parsed.value;
        }
      } else {
        return null;
      }
    },
    [chainId]
  );

  return { setValue, getValue };
};
