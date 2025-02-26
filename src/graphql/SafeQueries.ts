import { Address, Hex } from 'viem';

// Define the base DAO structure that can be nested
interface Safe {
  id: Address;
  created: string;
  creator: Address;
  transactionHash: Hex;
  factoryAddress: Address;
  singleton: Address;
  setupData: Hex;
}

// Define the top-level DAO response structure
export interface SafeQueryResponse {
  safes: Safe[];
}

export const SafeQuery = `query SafeQuery($safeAddress: Bytes) {
  safes(where: { id: $safeAddress }) {
    id
    created
    creator
    transactionHash
    factoryAddress
    singleton
    setupData
  }
}`;
