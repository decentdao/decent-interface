import { logError } from '../../../helpers/errorLogging';
import { CacheExpiry, CacheKeys } from './cacheDefaults';
import { getValue, setValue } from './useLocalStorage';

export const runMigrations = async (
  // @dev import.meta.glob can not be mocked in tests, so we pass the count as an argument
  migrations = import.meta.glob('./migrations/*'),
) => {
  const migrationCount = Object.keys(migrations).length;
  const cacheVersion = getValue({ cacheName: CacheKeys.MIGRATION });
  const actualCacheVersion = cacheVersion || 0;
  if (cacheVersion === migrationCount) return;
  let newVersion = actualCacheVersion;
  // loop through each pending migration and run in turn
  for (let i = actualCacheVersion + 1; i <= migrationCount; i++) {
    try {
      const migration = (await migrations[`./migrations/${i}.ts`]()) as {
        default: () => Promise<void>;
      };
      await migration.default();
      newVersion = i;
    } catch (e) {
      logError(e);
      newVersion = i - 1;
    }
  }
  setValue({ cacheName: CacheKeys.MIGRATION }, newVersion, CacheExpiry.NEVER);
};
