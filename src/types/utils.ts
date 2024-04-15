import { Address } from 'viem';

export type EthAddress = { address?: Address | null };

export enum SortBy {
  Newest = 'newest',
  Oldest = 'oldest',
}
