import { useEffect, useRef } from 'react';
import { logError } from '../../../helpers/errorLogging';
import { CacheKeys } from './cacheDefaults';
import { getValue, setValue } from './useLocalStorage';

const migrations = import.meta.glob('./migrations/*');

export const runMigrations = async (
  // @dev import.meta.glob can not be mocked in tests, so we pass the count as an argument
  migrationCount: number = Object.keys(migrations).length,
) => {
  const cacheVersion = getValue({ cacheName: CacheKeys.MIGRATION });

  const actualCacheVersion = cacheVersion || 0;
  let newVersion = actualCacheVersion;
  // loop through each pending migration and run in turn
  for (let i = actualCacheVersion + 1; i <= migrationCount; i++) {
    try {
      const migration: { default: () => void } = await import(`./migrations/${i}`);
      migration.default();
      newVersion = i;
    } catch (e) {
      logError(e);
      newVersion = i - 1;
    }
  }
  setValue({ cacheName: CacheKeys.MIGRATION }, newVersion);
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
