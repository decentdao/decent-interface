import { useEffect, useRef, useState } from 'react';
import { addNetworkPrefix } from './../../../utils/url';
// This should be a temporary hook to migrate the old local storage to the new one
// and should be removed after a few months

import { CacheKeys, CacheKeysV0 } from './cacheDefaults';

export const useMigrateLocalStorageV1 = () => {
  const isMounted = useRef(false);
  const [isMigrated, setIsMigrated] = useState(false);

  useEffect(() => {
    if (isMounted.current) return;
    // Migrate old cache keys to new format
    if (isMigrated) return;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      const prefix = key.split('_')[0];
      const chainId = key.split('_')[1];
      if (prefix === 'fract') {
        // const storagePrefixLength = prefix.length + chainId.length + 2;
        // const isMaster = key.includes(CacheKeysV0.MASTER_COPY_PREFIX)
        // // Migrate Master Copy cache
        // if(isMaster) {
        //   const cacheNameFull = key.substring(storagePrefixLength)
        //   const [, uniqueId] = cacheNameFull.split(CacheKeysV0.MASTER_COPY_PREFIX)
        //   const newKey = {
        //     name: CacheKeys.MASTER_COPY,
        //     chainId: chainId,
        //     proxyAddress: uniqueId,
        //   }
        //   const value = localStorage.getItem(key)
        //   localStorage.setItem(JSON.stringify(newKey), value!)
        //   localStorage.removeItem(key)
        // }
        // const isFavoriteCache = key.includes(CacheKeysV0.FAVORITES);
        // // Migrate Favorites cache
        // if (isFavoriteCache) {
        //   const value = localStorage.getItem(key);
        //   if (value) {
        //     localStorage.removeItem(key);
        //     const [, favoritedChainId] = key.split('_');
        //     console.log('🚀 ~ _chainId:', favoritedChainId);

        //     const newKey = {
        //       name: CacheKeys.FAVORITES,
        //     };
        //     localStorage.setItem(
        //       JSON.stringify(newKey),
        //       addNetworkPrefix(value, Number(favoritedChainId)),
        //     );
        //     // localStorage.removeItem(key)
        //   }
        // }
        // const isAverageBlockTime = key.includes(CacheKeysV0.AVERAGE_BLOCK_TIME)
        // // Migrate Average Block Time cache, more to remove the old one than to migrate
        // if(isAverageBlockTime) {
        //   const value = localStorage.getItem(key)
        //   const newKey = {
        //     name: CacheKeys.AVERAGE_BLOCK_TIME,
        //   }
        //   localStorage.setItem(JSON.stringify(newKey), value!)
        //   localStorage.removeItem(key)
        // }
      }
    });
    setIsMigrated(true);
    isMounted.current = true;
  }, [isMigrated]);

  return isMigrated;
};
