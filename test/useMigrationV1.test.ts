import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheKeys } from '../src/hooks/utils/cache/cacheDefaults';
import migrateCacheToV1 from '../src/hooks/utils/cache/migrations/1';
import { getValue } from '../src/hooks/utils/cache/useLocalStorage';

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('migrateCacheToV1', () => {
  it('should correctly migrate a single favorite', () => {
    const oldKey = 'fract_11155111_favorites';
    const oldValue = JSON.stringify({
      v: ['0xd418E98a11B9189fCc05cddfbB10F4Cee996C749'],
      e: -1,
    });
    localStorage.setItem(oldKey, oldValue);

    const expectedNewValue = ['sep:0xd418E98a11B9189fCc05cddfbB10F4Cee996C749'];

    migrateCacheToV1();
    const favoriteCache = getValue({ cacheName: CacheKeys.FAVORITES });
    if (!favoriteCache) {
      throw new Error('Favorites cache not found');
    }
    expect(favoriteCache).toStrictEqual(expectedNewValue);

    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    if (!migrationCache) {
      throw new Error('Migration cache not found');
    }
    expect(migrationCache).toBe(1);

    expect(localStorage.getItem(oldKey)).toBeNull();
  });

  it('should correctly migrate multiple favorites from different networks', () => {
    const oldKey1 = 'fract_11155111_favorites';
    const oldValue1 = JSON.stringify({
      v: ['0xd418E98a11B9189fCc05cddfbB10F4Cee996C749'],
      e: -1,
    });

    const oldKey2 = 'fract_1_favorites';
    const oldValue2 = JSON.stringify({
      v: ['0xabcdE98a11B9189fCc05cddfbB10F4Cee996C999'],
      e: -1,
    });

    localStorage.setItem(oldKey1, oldValue1);
    localStorage.setItem(oldKey2, oldValue2);

    const expectedNewValue = [
      'sep:0xd418E98a11B9189fCc05cddfbB10F4Cee996C749',
      'eth:0xabcdE98a11B9189fCc05cddfbB10F4Cee996C999',
    ];

    migrateCacheToV1();
    const favoriteCache = getValue({ cacheName: CacheKeys.FAVORITES });
    if (!favoriteCache) {
      throw new Error('Favorites cache not found');
    }
    expect(favoriteCache).toStrictEqual(expectedNewValue);
    expect(localStorage.getItem(oldKey1)).toBeNull();
    expect(localStorage.getItem(oldKey2)).toBeNull();

    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    if (!migrationCache) {
      throw new Error('Migration cache not found');
    }
    expect(migrationCache).toBe(1);
  });

  it('should handle an empty localStorage without errors', () => {
    migrateCacheToV1();

    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    if (!migrationCache) {
      throw new Error('Migration cache not found');
    }
    expect(migrationCache).toBe(1);
  });

  it('should handle localStorage without relevant keys', () => {
    localStorage.setItem('unrelatedKey', 'someValue');
    migrateCacheToV1();

    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    if (!migrationCache) {
      throw new Error('Migration cache not found');
    }
    expect(migrationCache).toBe(1);

    expect(localStorage.getItem('unrelatedKey')).toBe('someValue');
  });

  it('should handle favorites without chain IDs correctly', () => {
    const oldKey = 'fract_favorites';
    const oldValue = JSON.stringify({
      v: ['0x1234abcd5678efgh91011ijklmno1234'],
      e: -1,
    });
    localStorage.setItem(oldKey, oldValue);

    migrateCacheToV1();

    expect(localStorage.getItem(oldKey)).toBeNull();
    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    if (!migrationCache) {
      throw new Error('Migration cache not found');
    }
    expect(migrationCache).toBe(1);
  });
});
