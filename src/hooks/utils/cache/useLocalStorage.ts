import { parseISO } from 'date-fns';
import {
  CacheExpiry,
  IStorageValue,
  FavoritesCacheKey,
  MasterCacheKey,
  CacheKey,
  CURRENT_CACHE_VERSION,
} from './cacheDefaults';

type Key = FavoritesCacheKey | MasterCacheKey | Omit<CacheKey, 'version'>;

function bigintReplacer(key: any, value: any) {
  return typeof value === 'bigint'
    ? `bigint:${value.toString()}`
    : value instanceof Date
      ? value.toISOString()
      : value;
}

function proposalObjectReviver(key: any, value: any) {
  if (typeof value === 'string') {
    if (value.startsWith('bigint:')) return BigInt(value.substring(7));
    const isoStringRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (isoStringRegex.test(value)) return parseISO(value);
  }

  return value;
}

export const setValue = (
  key: Key,
  value: any,
  expirationMinutes: number = CacheExpiry.ONE_WEEK,
): void => {
  if (typeof window !== 'undefined') {
    const val: IStorageValue = {
      v: value,
      e:
      expirationMinutes === CacheExpiry.NEVER
      ? CacheExpiry.NEVER
      : Date.now() + expirationMinutes * 60000,
    };
    localStorage.setItem(JSON.stringify({ ...key, version: CURRENT_CACHE_VERSION }), JSON.stringify(val, bigintReplacer));
  }
};

export const getValue = (key: Key, version = CURRENT_CACHE_VERSION): any => {
  if (typeof window !== 'undefined') {
    const rawVal = localStorage.getItem(JSON.stringify({ ...key, version }));
    if (rawVal) {
      const parsed: IStorageValue = JSON.parse(rawVal, proposalObjectReviver);
      if (parsed.e === CacheExpiry.NEVER) {
        return parsed.v;
      } else {
        if (parsed.e < Date.now()) {
          localStorage.removeItem(JSON.stringify(key));
          return null;
        } else {
          return parsed.v;
        }
      }
    } else {
      return null;
    }
  }
};
