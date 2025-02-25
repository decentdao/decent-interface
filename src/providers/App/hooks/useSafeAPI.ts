import SafeApiKit, {
  AllTransactionsListResponse,
  AllTransactionsOptions,
  SafeCreationInfoResponse,
  SafeInfoResponse,
  TokenInfoResponse,
} from '@safe-global/api-kit';
import axios from 'axios';
import { useMemo } from 'react';
import { Address, createPublicClient, getAddress, http, PublicClient, zeroAddress } from 'viem';
import GnosisSafeL2Abi from '../../../assets/abi/GnosisSafeL2';
import { SENTINEL_ADDRESS } from '../../../constants/common';
import useNetworkPublicClient from '../../../hooks/useNetworkPublicClient';
import { CacheExpiry } from '../../../hooks/utils/cache/cacheDefaults';
import {
  DBObjectKeys,
  getIndexedDBValue,
  setIndexedDBValue,
} from '../../../hooks/utils/cache/useLocalDB';
import { SafeWithNextNonce } from '../../../types';
import { NetworkConfig } from '../../../types/network';
import { useNetworkConfigStore } from '../../NetworkConfig/useNetworkConfigStore';

class EnhancedSafeApiKit extends SafeApiKit {
  readonly publicClient: PublicClient;
  readonly networkConfig: NetworkConfig;

  // holds requests that have yet to return, to avoid calling the same
  // endpoint more than once
  requestMap = new Map<string, Promise<any> | null>();

  constructor(publicClient: PublicClient, networkConfig: NetworkConfig) {
    super({ chainId: BigInt(networkConfig.chain.id) });
    this.publicClient = publicClient;
    this.networkConfig = networkConfig;
  }

  private async setCache(key: string, value: any, cacheMinutes: number): Promise<void> {
    await setIndexedDBValue(
      DBObjectKeys.SAFE_API,
      key,
      value,
      this.networkConfig.chain.id,
      cacheMinutes,
    );
  }

  private async getCache<T>(key: string): Promise<T> {
    const value: T = await getIndexedDBValue(
      DBObjectKeys.SAFE_API,
      key,
      this.networkConfig.chain.id,
    );
    return value;
  }

  private async request<T>(
    cacheKey: string,
    cacheMinutes: number,
    endpoint: () => Promise<T>,
  ): Promise<T> {
    let value: T = await this.getCache<T>(cacheKey);
    if (!value) {
      let call = this.requestMap.get(cacheKey);
      if (!call) {
        call = endpoint();
        this.requestMap.set(cacheKey, call);
      }
      try {
        value = await call;
        this.requestMap.set(cacheKey, null);
        await this.setCache(cacheKey, value, cacheMinutes);
      } catch (error) {
        /*
        await call can throw an exception with the Promise being rejected
        Without resetting the cache, the same promise will be used in retrials and always throw an exception
        */
        this.requestMap.set(cacheKey, null);
        throw error;
      }
    }
    return value;
  }

  override async getSafeInfo(safeAddress: Address): Promise<SafeInfoResponse> {
    const checksummedSafeAddress = getAddress(safeAddress);

    try {
      return await super.getSafeInfo(checksummedSafeAddress);
    } catch (error) {
      console.error('Error fetching getSafeInfo from safeAPI:', error);
      // Fetch necessary details from the contract
      const [nonce, threshold, modules, owners, version] = await this.publicClient.multicall({
        contracts: [
          {
            abi: GnosisSafeL2Abi,
            address: checksummedSafeAddress,
            functionName: 'nonce',
          },
          {
            abi: GnosisSafeL2Abi,
            address: checksummedSafeAddress,
            functionName: 'getThreshold',
          },
          {
            abi: GnosisSafeL2Abi,
            address: checksummedSafeAddress,
            functionName: 'getModulesPaginated',
            args: [SENTINEL_ADDRESS, 10n],
          },
          {
            abi: GnosisSafeL2Abi,
            address: checksummedSafeAddress,
            functionName: 'getOwners',
          },
          {
            abi: GnosisSafeL2Abi,
            address: checksummedSafeAddress,
            functionName: 'VERSION',
          },
        ],
        allowFailure: false,
      });

      // Fetch guard using getStorageAt
      const GUARD_STORAGE_SLOT = '0x3a'; // Slot defined in Safe contracts (could vary)
      const guardStorageValue = await this.publicClient.getStorageAt({
        address: checksummedSafeAddress,
        slot: GUARD_STORAGE_SLOT,
      });

      return {
        address: checksummedSafeAddress,
        nonce: Number(nonce ? nonce : 0),
        threshold: Number(threshold ? threshold : 0),
        owners: owners as string[],
        modules: [...modules[0], modules[1]],
        fallbackHandler: zeroAddress, // not used
        guard: guardStorageValue ? getAddress(`0x${guardStorageValue.slice(-40)}`) : zeroAddress,
        version: version,
        singleton: zeroAddress, // not used
      };
    }
  }

  override async getSafeCreationInfo(safeAddress: Address): Promise<SafeCreationInfoResponse> {
    try {
      return await super.getSafeCreationInfo(safeAddress);
    } catch (error) {
      console.error('Error fetching getSafeCreationInfo from safeAPI:', error);

      const value = await axios.get(
        `https://safe-client.safe.global/v1/chains/${this.networkConfig.chain.id}/safes/${safeAddress}/transactions/creation`,
        {
          headers: {
            accept: 'application/json',
          },
        },
      );

      return value.data as SafeCreationInfoResponse;
    }
  }

  override async getAllTransactions(
    safeAddress: Address,
    options?: AllTransactionsOptions,
  ): Promise<AllTransactionsListResponse> {
    const value = await this.request(
      'getAllTransactions' + safeAddress + options?.toString(),
      1,
      () => {
        return super.getAllTransactions(safeAddress, options);
      },
    );
    return value;
  }

  override async getNextNonce(safeAddress: Address): Promise<number> {
    let nextNonce = 0;

    try {
      nextNonce = await super.getNextNonce(safeAddress);
    } catch (error) {
      console.error('Error fetching getNextNonce from safeAPI:', error);

      // the safe-transactions-service is where any pending transactions
      // are stored. if we can't get them, the only data we have available
      // is the nonce from the contract.

      const nonce = await this.publicClient.readContract({
        address: safeAddress,
        abi: GnosisSafeL2Abi,
        functionName: 'nonce',
      });

      nextNonce = Number(nonce.toString());
    }

    return nextNonce;
  }

  async getSafeData(safeAddress: Address): Promise<SafeWithNextNonce> {
    const checksummedSafeAddress = getAddress(safeAddress);
    const safeInfoResponse = await this.getSafeInfo(checksummedSafeAddress);
    const nextNonce = await this.getNextNonce(checksummedSafeAddress);
    return { ...safeInfoResponse, nextNonce };
  }

  override async getToken(tokenAddress: string): Promise<TokenInfoResponse> {
    const value = await this.request('getTokenData' + tokenAddress, CacheExpiry.NEVER, () => {
      return super.getToken(tokenAddress);
    });
    return value;
  }
}

export function useSafeAPI() {
  const { getConfigByChainId, chain } = useNetworkConfigStore();
  const publicClient = useNetworkPublicClient();

  const networkConfig = getConfigByChainId(chain.id);

  const safeAPI = useMemo(() => {
    return new EnhancedSafeApiKit(publicClient, networkConfig);
  }, [networkConfig, publicClient]);

  return safeAPI;
}

export function getSafeAPI(networkConfig: NetworkConfig) {
  const publicClient = createPublicClient({
    chain: networkConfig.chain,
    transport: http(networkConfig.rpcEndpoint),
  });
  return new EnhancedSafeApiKit(publicClient, networkConfig);
}
