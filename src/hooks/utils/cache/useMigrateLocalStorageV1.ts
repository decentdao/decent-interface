import { useEffect, useRef, useState } from 'react';
import { addNetworkPrefix } from './../../../utils/url';
// This should be a temporary hook to migrate the old local storage to the new one
// and should be removed after a few months

import { CacheKeys, CacheKeysV0 } from './cacheDefaults';
import { setValue } from './useLocalStorage';

export const useMigrateLocalStorageV1 = () => {
  const isMounted = useRef(false);
  const [isMigrated, setIsMigrated] = useState(false);

  useEffect(() => {
    // prevent multiple calls
    if (isMounted.current) return;
    if (isMigrated) return;

    // Migrate old cache keys to new format
    const keys = Object.keys(localStorage);
    const fractKeys = keys.filter(key => key.includes('fract'));

    if (!fractKeys.length) {
      setIsMigrated(true);
      return;
    }
    // Get All Network Favorites
    const favoritesCache = fractKeys.filter(key => key.includes(CacheKeysV0.FAVORITES));
    const newFavorites: string[] = [];

    if (!favoritesCache.length) {
      setIsMigrated(true);
      return;
    }
    // loop through all favorites
    favoritesCache.forEach(favorite => {
      // Get ChainId from favorite key
      const [, chainId] = favorite.split('_');
      const favoritesValue = localStorage.getItem(favorite);
      if (favoritesValue) {
        // Parse favorites value and add network prefix
        const parsedValue: string[] = JSON.parse(favoritesValue);
        parsedValue.forEach((value: string) => {
          newFavorites.push(addNetworkPrefix(value, Number(chainId)));
        });
      }
    });
    // Set new Favorites cache
    setValue({ cacheName: CacheKeys.FAVORITES }, newFavorites);

    // delete old cache
    fractKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    setIsMigrated(true);
    isMounted.current = true;
  }, [isMigrated]);

  return isMigrated;
};
