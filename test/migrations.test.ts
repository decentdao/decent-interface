import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as logging from '../src/helpers/errorLogging';
import { CacheKeys } from '../src/hooks/utils/cache/cacheDefaults';
import migrateCacheToV1 from '../src/hooks/utils/cache/migrations/1';
import { getValue } from '../src/hooks/utils/cache/useLocalStorage';
import { runMigrations } from '../src/hooks/utils/cache/useMigrate';

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

    migrateCacheToV1();
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

    migrateCacheToV1();
    const favoriteCache = getValue({ cacheName: CacheKeys.FAVORITES });
    expect(favoriteCache).toStrictEqual(expectedNewValue);
    expect(localStorage.getItem(oldKey1)).toBeNull();
    expect(localStorage.getItem(oldKey2)).toBeNull();
  });

  it('should handle an empty localStorage without errors', () => {
    migrateCacheToV1();
  });

  it('should handle localStorage without relevant keys', () => {
    localStorage.setItem('unrelatedKey', 'someValue');
    migrateCacheToV1();

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
  });
});

describe('func runMigrations (gap imports)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    localStorage.clear();
    vi.spyOn(logging, 'logError').mockImplementation(() => {});
    vi.doMock('./migrations/1', () => ({ default: vi.fn() }));
    vi.doMock('./migrations/2', () => ({ default: vi.fn() }));
    vi.doMock('./migrations/4', () => ({ default: vi.fn() }));
  });

  it('should stop migration at first gap and log an error', async () => {
    await runMigrations(3);
    expect(logging.logError).toHaveBeenCalledOnce();
    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    expect(migrationCache).toBe(2);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});

describe('func runMigrations (invalid filename)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    localStorage.clear();
    vi.spyOn(logging, 'logError').mockImplementation(() => {});
    vi.doMock('./migrations/1', () => ({ default: vi.fn() }));
    vi.doMock('./migrations/2', () => ({ default: vi.fn() }));
    vi.doMock('./migrations/foo', () => ({ default: vi.fn() }));
  });

  it('should stop migration at malformed file name and log an error', async () => {
    await runMigrations(3);
    expect(logging.logError).toHaveBeenCalledOnce();
    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    expect(migrationCache).toBe(2);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});

describe('func runMigrations (successfully migrate to lastest)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    vi.doMock('./migrations/1', () => ({ default: () => {} }));
    vi.doMock('./migrations/2', () => ({ default: () => {} }));
    vi.doMock('./migrations/3', () => ({ default: () => {} }));
  });

  it('should successfully migrate to the latest version', async () => {
    await runMigrations(3);
    const migrationCache = getValue({ cacheName: CacheKeys.MIGRATION });
    expect(migrationCache).toBe(3);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
