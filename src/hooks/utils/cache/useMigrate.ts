import fs from 'fs';
import path from 'path';
import { useEffect, useRef } from 'react';
import { logError } from '../../../helpers/errorLogging';
import { CacheKeys } from './cacheDefaults';
import { getValue, setValue } from './useLocalStorage';

export const runMigrations = async () => {
  const cacheVersion = getValue({ cacheName: CacheKeys.MIGRATION });

  const actualCacheVersion = cacheVersion || 0;
  const migrationsPath = path.resolve(__dirname, './migrations');
  const migrationFiles = fs.readdirSync(migrationsPath);
  const migrationCount = migrationFiles.length;
  // loop through each pending migration and run in turn
  for (let i = actualCacheVersion + 1; i <= migrationCount; i++) {
    const migration = await import(`./migrations/${i}`);
    try {
      migration.default();
    } catch (e) {
      logError(e);
      setValue({ cacheName: CacheKeys.MIGRATION }, i - 1);
      return;
    }
  }
  setValue({ cacheName: CacheKeys.MIGRATION }, migrationCount);
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
