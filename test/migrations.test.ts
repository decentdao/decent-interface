import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as logging from '../src/helpers/errorLogging';
import { CacheKeys } from '../src/hooks/utils/cache/cacheDefaults';
import migration1 from '../src/hooks/utils/cache/migrations/1';
import { runMigrations } from '../src/hooks/utils/cache/runMigrations';
import { getValue } from '../src/hooks/utils/cache/useLocalStorage';

describe('func migrateCacheToV1', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });
  it('should correctly migrate a single favorite', () => {
    const oldKey = 'fract_11155111_favorites';
    const oldValue = JSON.stringify({
      v: ['0xd418E98a11B9189fCc05cddfbB10F4Cee996C749'],
      e: -1,
    });
    localStorage.setItem(oldKey, oldValue);

    const expectedNewValue = ['sep:0xd418E98a11B9189fCc05cddfbB10F4Cee996C749'];

    migration1();
    const favoriteCache = getValue({ cacheName: CacheKeys.FAVORITES });
    expect(favoriteCache).toStrictEqual(expectedNewValue);
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

    migration1();
    const favoriteCache = getValue({ cacheName: CacheKeys.FAVORITES });
    expect(favoriteCache).toStrictEqual(expectedNewValue);
    expect(localStorage.getItem(oldKey1)).toBeNull();
    expect(localStorage.getItem(oldKey2)).toBeNull();
  });

  it('should handle an empty localStorage without errors', () => {
    migration1();
  });

  it('should handle localStorage without relevant keys', () => {
    localStorage.setItem('unrelatedKey', 'someValue');
    migration1();

    expect(localStorage.getItem('unrelatedKey')).toBe('someValue');
  });

  it('should handle favorites without chain IDs correctly', () => {
    const oldKey = 'fract_favorites';
    const oldValue = JSON.stringify({
      v: ['0x1234abcd5678efgh91011ijklmno1234'],
      e: -1,
    });
    localStorage.setItem(oldKey, oldValue);

    migration1();

    expect(localStorage.getItem(oldKey)).toBeNull();
  });
});

describe('func runMigrations (gap imports)', () => {
  const migrations = {
    './migrations/1.ts': () => Promise.resolve({ default: vi.fn() }),
    './migrations/2.ts': () => Promise.resolve({ default: vi.fn() }),
    './migrations/4.ts': () => Promise.resolve({ default: vi.fn() }),
  };
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    localStorage.clear();
    vi.spyOn(logging, 'logError').mockImplementation(() => {});
    Object.entries(migrations).forEach(([p, m]) => {
      vi.doMock(p, m);
    });
  });

  it('should stop migration at first gap and log an error', async () => {
    await runMigrations(migrations);
    expect(logging.logError).toHaveBeenCalledOnce();
    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    expect(migrationCache).toBe(2);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});

describe('func runMigrations (invalid filename)', () => {
  const migrations = {
    './migrations/1.ts': () => Promise.resolve({ default: vi.fn() }),
    './migrations/2.ts': () => Promise.resolve({ default: vi.fn() }),
    './migrations/foo.ts': () => Promise.resolve({ default: vi.fn() }),
  };
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    localStorage.clear();
    vi.spyOn(logging, 'logError').mockImplementation(() => {});
    Object.entries(migrations).forEach(([p, m]) => {
      vi.doMock(p, m);
    });
  });

  it('should stop migration at malformed file name and log an error', async () => {
    await runMigrations(migrations);
    expect(logging.logError).toHaveBeenCalledOnce();
    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    expect(migrationCache).toBe(2);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});

describe('func runMigrations (successfully migrate to lastest)', () => {
  const migrations = {
    './migrations/1.ts': () => Promise.resolve({ default: vi.fn() }),
    './migrations/2.ts': () => Promise.resolve({ default: vi.fn() }),
    './migrations/3.ts': () => Promise.resolve({ default: vi.fn() }),
  };
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    Object.entries(migrations).forEach(([p, m]) => {
      vi.doMock(p, m);
    });
  });

  it('should successfully migrate to the latest version', async () => {
    const migrationCacheBefore = getValue({ cacheName: CacheKeys.MIGRATION });
    expect(migrationCacheBefore).toBe(null);

    await runMigrations(migrations);

    const migrationCacheAfter = getValue({ cacheName: CacheKeys.MIGRATION });
    expect(migrationCacheAfter).toBe(3);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
