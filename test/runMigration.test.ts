import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CACHE_VERSIONS, CacheKeys } from '../src/hooks/utils/cache/cacheDefaults';
import { getValue, setValue } from '../src/hooks/utils/cache/useLocalStorage';
import { runMigrations } from '../src/hooks/utils/cache/useMigrate';

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('run migrations', () => {
  it('should set migration version to current', async () => {
    const oldKey = 'fract_11155111_favorites';
    const oldValue = JSON.stringify({
      v: ['0xd418E98a11B9189fCc05cddfbB10F4Cee996C749'],
      e: -1,
    });
    localStorage.setItem(oldKey, oldValue);

    await runMigrations();
    
    const expectedNewValue = ['sep:0xd418E98a11B9189fCc05cddfbB10F4Cee996C749'];
    const favoriteCache = getValue({ cacheName: CacheKeys.FAVORITES });
    if (!favoriteCache) {
      throw new Error('Favorites cache not found');
    }
    expect(favoriteCache).toStrictEqual(expectedNewValue);
    
    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    if (!migrationCache) {
      throw new Error('Migration cache not found');
    }
    expect(migrationCache).toBe(CACHE_VERSIONS[CacheKeys.MIGRATION]);
  });

  it('should early exit', async () => {
    setValue({cacheName: CacheKeys.FAVORITES}, ['sep:0xd418E98a11B9189fCc05cddfbB10F4Cee996C749']);
    setValue({cacheName: CacheKeys.MIGRATION}, CACHE_VERSIONS[CacheKeys.MIGRATION]);

    await runMigrations();

    
    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    if (!migrationCache) {
      throw new Error('Migration cache not found');
    }
    expect(migrationCache).toBe(CACHE_VERSIONS[CacheKeys.MIGRATION]);
  });
});
