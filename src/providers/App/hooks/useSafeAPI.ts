import SafeApiKit, {
  AllTransactionsListResponse,
  AllTransactionsOptions,
  OwnerResponse,
  SafeCreationInfoResponse,
  SafeInfoResponse,
  SafeApiKitConfig,
  TokenInfoListResponse,
} from '@safe-global/api-kit';
import { useMemo } from 'react';
import { CacheExpiry } from '../../../hooks/utils/cache/cacheDefaults';
import {
  DBObjectKeys,
  getIndexedDBValue,
  setIndexedDBValue,
} from '../../../hooks/utils/cache/useLocalDB';
import { useNetworkConfig } from '../../NetworkConfig/NetworkConfigProvider';

class CachingSafeApiKit extends SafeApiKit {
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
      value = await call;
      this.requestMap.set(cacheKey, null);
      await this.setCache(cacheKey, value, cacheMinutes);
    }
    return value;
  }
  override async decodeData(data: string): Promise<any> {
    const value = await this.request('decodeData' + data, 1, () => {
      return super.decodeData(data);
    });
    return value;
  }
  override async getSafesByOwner(ownerAddress: string): Promise<OwnerResponse> {
    const value = await this.request('getSafesByOwner' + ownerAddress, 1, () => {
      return super.getSafesByOwner(ownerAddress);
    });
    return value;
  }
  override async getSafeInfo(safeAddress: string): Promise<SafeInfoResponse> {
    const value = await this.request('getSafeInfo' + safeAddress, 5, () => {
      return super.getSafeInfo(safeAddress);
    });
    return value;
  }
  override async getSafeCreationInfo(safeAddress: string): Promise<SafeCreationInfoResponse> {
    const value = await this.request('getSafeCreationInfo' + safeAddress, CacheExpiry.NEVER, () => {
      return super.getSafeCreationInfo(safeAddress);
    });
    return value;
  }
  override async getTokenList(): Promise<TokenInfoListResponse> {
    const value = await this.request('getTokenList', 1, () => {
      return super.getTokenList();
    });
    return value;
  }
  override async getAllTransactions(
    safeAddress: string,
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

  async getSafeData(safeAddress: string): Promise<SafeInfoResponseWithGuard> {
    const safeInfoResponse = await this.getSafeInfo(safeAddress);
    const nextNonce = await this.getNextNonce(safeAddress);
    const safeInfo = { ...safeInfoResponse, nextNonce };
    return safeInfo;
  }
}

export function useSafeAPI() {
  const { chain } = useNetworkConfig();

  const safeAPI = useMemo(() => {
    return new CachingSafeApiKit({ chainId: BigInt(chain.id) });
  }, [chain]);

  return safeAPI;
}
