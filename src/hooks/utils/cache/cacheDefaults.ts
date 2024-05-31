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

// Increment this strictly by 1s, as it is used for version comparison.
const CURRENT_CACHE_VERSION = 1;
const VERSION_PREFIX = `v${CURRENT_CACHE_VERSION}::`;

/**
 * Checks if the key begins with "v", contains a number, and ends with "::",
 * the format for a version-prefixed cache key.
 * */
function isVersionedKey(key: string): boolean {
  // Does the key start with "v"?
  if (!key.startsWith('v')) {
    return false;
  }

  // Does the key contain the version prefix terminator, "::"?
  const keyVersionPrefixIndex = key.indexOf('::');
  if (keyVersionPrefixIndex === -1) {
    return false;
  }

  // Is the set of characters between "v" and "::" a number?
  const keyVersion = key.substring(1, keyVersionPrefixIndex);
  if (isNaN(Number(keyVersion))) {
    return false;
  }

  return true;
}

/**
 * Extracts the version number from a version-prefixed cache key.
 *
 * This function assumes that the key is a valid versioned key.
 * @dev if ever using this function in any other context, include error checking first.
 */
function getVersionedKeyVersion(key: string): number {
  // I'm fine with no error checking here, as this function is only called
  // on keys filtered by `isVersionedKey`, in `clearOldVersionCache`.
  return Number(key.substring(1, key.indexOf('::')));
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
export function keyInternal(chainId: number, key: string, isVersioned: boolean): string {
  return `${isVersioned ? VERSION_PREFIX : ''}fract_${chainId}_${key}`;
}

// @dev where's a good place to call this?
export function clearOldVersionCache() {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage);
    keys.filter(isVersionedKey).forEach(versionedKey => {
      if (getVersionedKeyVersion(versionedKey) < CURRENT_CACHE_VERSION) {
        localStorage.removeItem(versionedKey);
      }
    });
  }
}
