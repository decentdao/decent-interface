export interface IStorageValue {
  // the value to store, 1 character to minimize cache size
  v: any;
  // the expiration, as a UTC timestamp
  e: number;
}

/**
 * Useful defaults for cache expiration minutes.
 */
export enum CacheExpiry {
  NEVER = -1,
  ONE_HOUR = 60,
  ONE_DAY = ONE_HOUR * 24,
  ONE_WEEK = ONE_DAY * 7,
}

/**
 * The list of cache keys used in the app.
 *
 * To avoid weird caching bugs, hardcoding
 * keys should be avoided, always add the
 * cache key here.
 */
export enum CacheKeys {
  PROPOSAL_PREFIX = 'proposal',
  FAVORITES = 'favorites',
  DECODED_TRANSACTION_PREFIX = 'decode_trans_',
  MULTISIG_METADATA_PREFIX = 'm_m_',
  MASTER_COPY_PREFIX = 'master_copy_of_',
}

interface IndexedObject {
  [key: string]: any;
}

/**
 * Cache default values.
 *
 * Cache keys are not required to have a default value.
 */
export const CACHE_DEFAULTS: IndexedObject = {
  [CacheKeys.FAVORITES.toString()]: Array<string>(),
};

/**
 * Cached values are specific to the connected chain, so any caching
 * mechanism should internally combine the key set in CacheKeys
 * along with the chainId.
 */
export function keyInternal(chainId: number, key: string): string {
  return 'fract_' + chainId + '_' + key;
}
