import { Address } from 'viem';
import { AzoriusProposal, DaoHierarchyInfo } from '../../../types';

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
  // local storage keys
  FAVORITES = 'Favorites',
  MASTER_COPY = 'Master Copy',
  AVERAGE_BLOCK_TIME = 'Average Block Time',
  PROPOSAL_CACHE = 'Proposal',
  MIGRATION = 'Migration',
  IPFS_HASH = 'IPFS Hash',
  HIERARCHY_DAO_INFO = 'Hierarchy DAO Info',
  // indexDB keys
  DECODED_TRANSACTION_PREFIX = 'decode_trans_',
  MULTISIG_METADATA_PREFIX = 'm_m_',
}

export type CacheKey = {
  cacheName: CacheKeys;
  version: number;
};

export interface FavoritesCacheKey extends CacheKey {
  cacheName: CacheKeys.FAVORITES;
}

export interface MasterCacheKey extends CacheKey {
  cacheName: CacheKeys.MASTER_COPY;
  chainId: number;
  proxyAddress: Address;
  moduleProxyFactoryAddress: Address;
}

export interface ProposalCacheKey extends CacheKey {
  cacheName: CacheKeys.PROPOSAL_CACHE;
  proposalId: string;
  contractAddress: Address;
}

export interface AverageBlockTimeCacheKey extends CacheKey {
  cacheName: CacheKeys.AVERAGE_BLOCK_TIME;
  chainId: number;
}

export interface IPFSHashCacheKey extends CacheKey {
  cacheName: CacheKeys.IPFS_HASH;
  hash: string;
  chainId: number;
}
export interface HierarchyDAOInfoCacheKey extends CacheKey {
  cacheName: CacheKeys.HIERARCHY_DAO_INFO;
  chainId: number;
  daoAddress: Address;
}

export type CacheKeyType =
  | FavoritesCacheKey
  | HierarchyDAOInfoCacheKey
  | MasterCacheKey
  | ProposalCacheKey
  | AverageBlockTimeCacheKey
  | IPFSHashCacheKey
  | Omit<CacheKey, 'version'>;

export type CacheValue = {
  v: any;
  e: number;
};

export type FavoritesCacheValue = {
  networkPrefix: string;
  address: Address;
  name: string;
};

type CacheKeyToValueMap = {
  [CacheKeys.FAVORITES]: FavoritesCacheValue[];
  [CacheKeys.MASTER_COPY]: Address;
  [CacheKeys.PROPOSAL_CACHE]: AzoriusProposal;
  [CacheKeys.AVERAGE_BLOCK_TIME]: number;
  [CacheKeys.MIGRATION]: number;
  [CacheKeys.IPFS_HASH]: string;
  [CacheKeys.HIERARCHY_DAO_INFO]: DaoHierarchyInfo;
};

export type CacheValueType<T extends CacheKeyType> = T extends { cacheName: infer U }
  ? U extends keyof CacheKeyToValueMap
    ? CacheKeyToValueMap[U]
    : unknown
  : unknown;

interface IndexedObject {
  [key: string]: any;
}

export const CACHE_VERSIONS: { [key: string]: number } = Object.freeze({
  [CacheKeys.FAVORITES]: 2,
  [CacheKeys.MASTER_COPY]: 1,
  [CacheKeys.PROPOSAL_CACHE]: 1,
  [CacheKeys.AVERAGE_BLOCK_TIME]: 1,
});

/**
 * Cache default values.
 *
 * Cache keys are not required to have a default value.
 * @todo: The CACHE_DEFAULTs seem to be used for indexDB, But favorites is localstorage. We will need to revisit this.
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
