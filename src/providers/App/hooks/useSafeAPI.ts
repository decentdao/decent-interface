import SafeApiKit, {
  AllTransactionsListResponse,
  AllTransactionsOptions,
  SafeCreationInfoResponse,
  SafeInfoResponse,
  SafeApiKitConfig,
  TokenInfoResponse,
} from '@safe-global/api-kit';
import { useMemo } from 'react';
import { Address, getAddress, PublicClient, zeroAddress } from 'viem';
import GnosisSafeL2Abi from '../../../assets/abi/GnosisSafeL2';
import { SENTINEL_ADDRESS } from '../../../constants/common';
import { CacheExpiry } from '../../../hooks/utils/cache/cacheDefaults';
import {
  DBObjectKeys,
  getIndexedDBValue,
  setIndexedDBValue,
} from '../../../hooks/utils/cache/useLocalDB';
import { SafeWithNextNonce } from '../../../types';
import { useNetworkConfigStore } from '../../NetworkConfig/useNetworkConfigStore';
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type SafeInfo = Mutable<SafeWithNextNonce>;
class EnhancedSafeApiKit extends SafeApiKit {
  readonly CHAINID: number;

  // holds requests that have yet to return, to avoid calling the same
  // endpoint more than once
  requestMap = new Map<string, Promise<any> | null>();

  constructor({ chainId }: SafeApiKitConfig) {
    super({ chainId });
    this.CHAINID = Number(chainId);
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

  async getSafeData(safeAddress: Address, viemClient: PublicClient): Promise<SafeWithNextNonce> {
    const checksummedSafeAddress = getAddress(safeAddress);
    const safeInfoWithNonce: SafeInfo = {
      address: checksummedSafeAddress,
      nonce: 0,
      threshold: 0,
      owners: [],
      modules: [],
      fallbackHandler: '',
      guard: '',
      version: '',
      nextNonce: 0,
      singleton: '',
    };
    try {
      const safeInfoResponse = await this.getSafeInfo(checksummedSafeAddress);
      const nextNonce = await this.getNextNonce(checksummedSafeAddress);

      safeInfoWithNonce.nonce = safeInfoResponse.nonce;
      safeInfoWithNonce.threshold = safeInfoResponse.threshold;
      safeInfoWithNonce.owners = safeInfoResponse.owners;
      safeInfoWithNonce.modules = safeInfoResponse.modules;
      safeInfoWithNonce.fallbackHandler = safeInfoResponse.fallbackHandler;
      safeInfoWithNonce.guard = safeInfoResponse.guard;
      safeInfoWithNonce.version = safeInfoResponse.version;
      safeInfoWithNonce.nextNonce = nextNonce;
      safeInfoWithNonce.singleton = safeInfoResponse.singleton;
    } catch (_) {
      try {
        // Fetch necessary details from the contract

        const [nonce, threshold, modules, owners, version] = await viemClient.multicall({
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

        safeInfoWithNonce.nonce = Number(nonce ? nonce : 0);
        safeInfoWithNonce.threshold = Number(threshold ? threshold : 0);
        safeInfoWithNonce.owners = owners as string[];
        safeInfoWithNonce.modules = [...modules[0], modules[1]] as Address[];
        safeInfoWithNonce.fallbackHandler = zeroAddress; // WE don't use this

        // Fetch guard using getStorageAt
        const GUARD_STORAGE_SLOT = '0x3a'; // Slot defined in Safe contracts (could vary)
        const guardStorageValue = await viemClient.getStorageAt({
          address: checksummedSafeAddress,
          slot: GUARD_STORAGE_SLOT,
        });

        // Format and set the guard address
        safeInfoWithNonce.guard = guardStorageValue
          ? getAddress(`0x${guardStorageValue.slice(-40)}`)
          : zeroAddress;

        safeInfoWithNonce.version = version;
        safeInfoWithNonce.singleton = zeroAddress; // WE don't use this

        // Compute next nonce as it's not directly available
        safeInfoWithNonce.nextNonce = safeInfoWithNonce.nonce + 1;
      } catch (error) {
        console.error('Error fetching safe data:', error);
        throw new Error('Failed to fetch safe data');
      }
    }

    return safeInfoWithNonce;
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

  const safeAPI = useMemo(() => {
    return new EnhancedSafeApiKit({ chainId: BigInt(chain.id) });
  }, [chain]);

  return safeAPI;
}
