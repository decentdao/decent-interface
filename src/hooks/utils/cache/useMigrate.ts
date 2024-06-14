import { useEffect, useRef } from 'react';
import { CACHE_VERSIONS, CacheKeys } from './cacheDefaults';
import { getValue, setValue } from './useLocalStorage';

const runMigrations = () => {
  const cacheVersion = getValue({ cacheName: CacheKeys.MIGRATION });

  if (
    cacheVersion === null ||
    (cacheVersion && cacheVersion < CACHE_VERSIONS[CacheKeys.MIGRATION])
  ) {
    const actualCacheVersion = cacheVersion || 0;
    const migrationsToRun = CACHE_VERSIONS[CacheKeys.MIGRATION] - actualCacheVersion;
    // loop through each pending migration and run in turn
    for (let i = actualCacheVersion + 1; i <= migrationsToRun; i++) {
      const migration = require(`./migrations/${i}`);
      try {
        migration();
      } catch (e) {
        setValue({ cacheName: CacheKeys.MIGRATION }, i - 1);
        return;
      }
    }
    setValue({ cacheName: CacheKeys.MIGRATION }, CACHE_VERSIONS[CacheKeys.MIGRATION]);
  }
};

export const useMigrate = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    // prevent multiple calls
    if (isMounted.current) return;
    runMigrations();
    isMounted.current = true;
  }, []);
};
