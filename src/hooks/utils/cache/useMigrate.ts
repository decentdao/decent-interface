import { useEffect, useRef } from 'react';
import { logError } from '../../../helpers/errorLogging';
import { CACHE_VERSIONS, CacheKeys } from './cacheDefaults';
import { getValue, setValue } from './useLocalStorage';

export const runMigrations = async () => {
  const cacheVersion = getValue({ cacheName: CacheKeys.MIGRATION });

  if (
    cacheVersion === null ||
    (cacheVersion && cacheVersion < CACHE_VERSIONS[CacheKeys.MIGRATION])
  ) {
    const actualCacheVersion = cacheVersion || 0;
    const migrationsToRun = CACHE_VERSIONS[CacheKeys.MIGRATION] - actualCacheVersion;
    // loop through each pending migration and run in turn
    for (let i = actualCacheVersion + 1; i <= migrationsToRun; i++) {
      const migration = await import(`./migrations/${i}`);
      try {
        migration.default();
      } catch (e) {
        logError(e);
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
