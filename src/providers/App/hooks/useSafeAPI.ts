import SafeApiKit, {
  AllTransactionsListResponse,
  AllTransactionsOptions,
  SafeApiKitConfig,
  SafeCreationInfoResponse,
  SafeInfoResponse,
  TokenInfoResponse,
} from '@safe-global/api-kit';
import { useMemo } from 'react';
import { Address, getAddress, PublicClient, zeroAddress } from 'viem';
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
import { useNetworkConfigStore } from '../../NetworkConfig/useNetworkConfigStore';

class EnhancedSafeApiKit extends SafeApiKit {
  readonly CHAINID: number;
  readonly publicClient: PublicClient;
  // holds requests that have yet to return, to avoid calling the same
  // endpoint more than once
  requestMap = new Map<string, Promise<any> | null>();

  constructor({ chainId }: SafeApiKitConfig, publicClient: PublicClient) {
    super({ chainId });
    this.CHAINID = Number(chainId);
    this.publicClient = publicClient;
  }

  private async setCache(key: string, value: any, cacheMinutes: number): Promise<void> {
    await setIndexedDBValue(DBObjectKeys.SAFE_API, key, value, this.CHAINID, cacheMinutes);
  }

  private async getCache<T>(key: string): Promise<T> {
    const value: T = await getIndexedDBValue(DBObjectKeys.SAFE_API, key, this.CHAINID);
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
    const value = await this.request('getSafeInfo' + checksummedSafeAddress, 5, () => {
      return super.getSafeInfo(checksummedSafeAddress);
    });
    return value;
  }
  override async getSafeCreationInfo(safeAddress: Address): Promise<SafeCreationInfoResponse> {
    /*
      To replace this, we only need to search for the Safe Created Event, filtered by the address. No need to call Safe API
    */
    const value = await this.request('getSafeCreationInfo' + safeAddress, CacheExpiry.NEVER, () => {
      return super.getSafeCreationInfo(safeAddress);
    });
    return value;
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

  async getSafeData(safeAddress: Address): Promise<SafeWithNextNonce> {
    const checksummedSafeAddress = getAddress(safeAddress);
    try {
      const safeInfoResponse = await this.getSafeInfo(checksummedSafeAddress);
      const nextNonce = await this.getNextNonce(checksummedSafeAddress);
      return { ...safeInfoResponse, nextNonce };
    } catch (_) {
      try {
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
          nextNonce: Number(nonce ? nonce : 0) + 1,
        };
      } catch (error) {
        console.error('Error fetching safe data:', error);
        throw new Error('Failed to fetch safe data');
      }
    }
  }

  override async getToken(tokenAddress: string): Promise<TokenInfoResponse> {
    const value = await this.request('getTokenData' + tokenAddress, CacheExpiry.NEVER, () => {
      return super.getToken(tokenAddress);
    });
    return value;
  }
}

export function useSafeAPI() {
  const { chain } = useNetworkConfigStore();
  const publicClient = useNetworkPublicClient();

  const safeAPI = useMemo(() => {
    return new EnhancedSafeApiKit({ chainId: BigInt(chain.id) }, publicClient);
  }, [chain, publicClient]);

  return safeAPI;
}
