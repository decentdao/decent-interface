import { type KVNamespace } from '@cloudflare/workers-types';
import { Address } from 'viem';

export interface Env {
  balances: KVNamespace;
  MORALIS_API_KEY: string;
  BALANCES_CACHE_INTERVAL_MINUTES: string;
  BALANCES_MORALIS_INDEX_DELAY_MINUTES: string;
}

export interface Var {
  address: Address;
  network: string;
}
