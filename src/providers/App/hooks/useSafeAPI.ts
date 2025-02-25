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
import GnosisSafeProxyFactoryAbi from '../../../assets/abi/GnosisSafeProxyFactory';
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

  // TODO
  // kellar, start here plz!

  // for context,
  // the intention of the code changes in this file is to
  // remove the dependency on the Safe API. we want to implement
  // fallback onchain calls if the API call throws an error.

  // there will probably be some functions that we can't implement
  // without the Safe API, so for those, we can throw an error
  // and not implement the fallback.

  // for the functions that we can implement, we can use the chain
  // data to populate the return type.

  // so the work here is to:
  // 1. identify which functions can be implemented onchain
  // 2. implement the fallback onchain calls
  // 3. throw an error if the function can't be implemented onchain

  // Then, or maybe first to better contextualize your work, search
  // around the codebase for when these various functions are used.
  // also please search for any places where the safeApi object from
  // this class is calling functions that we have NOT overridden here.
  // in those cases, we will probably need to override them as well.
  // see 'getNextNonce' for an example of how to implement a simple
  // fallback.

  // also, there are some places in the app where calls to the
  // safe transactions service api are being made directly through fetch
  // or axios or something. i'm not exactly sure why those are bypassing
  // this file, but we can implement some functions for those api
  // calls in here as well, they just won't "override" anything.

  // start here by finishing the implementation of this function.
  override async getSafeCreationInfo(safeAddress: Address): Promise<SafeCreationInfoResponse> {
    try {
      return await super.getSafeCreationInfo(safeAddress);
    } catch (error) {
      console.error('Error fetching getSafeCreationInfo from safeAPI:', error);

      const safeCreationEvent = await this.publicClient.getContractEvents({
        abi: GnosisSafeProxyFactoryAbi,
        address: safeAddress, // todo: this should be the proxy factory address
        eventName: 'ProxyCreation',
        args: [safeAddress],
      });

      // if this event doesn't exist, then i'm not sure what to return
      // maybe undefined? we can't change the return type of this function.

      // get everything else you can from the chain to populate the return type

      // see "getSafeInfo" for an example of how to get a bunch of data from the chain.
      // in this function's case though, you'll need to use data from the event log too.
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
  const { chain } = useNetworkConfigStore();
  const publicClient = useNetworkPublicClient();

  const safeAPI = useMemo(() => {
    return new EnhancedSafeApiKit({ chainId: BigInt(chain.id) }, publicClient);
  }, [chain, publicClient]);

  return safeAPI;
}
