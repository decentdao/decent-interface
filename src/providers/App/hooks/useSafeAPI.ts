import EthersAdapter from '@safe-global/safe-ethers-lib';
import SafeServiceClient, {
  AllTransactionsListResponse,
  AllTransactionsOptions,
  MasterCopyResponse,
  ModulesResponse,
  OwnerResponse,
  SafeBalanceResponse,
  SafeBalancesOptions,
  SafeBalancesUsdOptions,
  SafeBalanceUsdResponse,
  SafeCollectibleResponse,
  SafeCollectiblesOptions,
  SafeCreationInfoResponse,
  SafeDelegateListResponse,
  SafeInfoResponse,
  SafeModuleTransactionListResponse,
  SafeMultisigTransactionEstimate,
  SafeMultisigTransactionEstimateResponse,
  SafeMultisigTransactionListResponse,
  SafeServiceClientConfig,
  SafeServiceInfoResponse,
  TokenInfoListResponse,
  TokenInfoResponse,
  TransferListResponse,
} from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import {
  DBObjectKeys,
  getIndexedDBValue,
  setIndexedDBValue,
} from '../../../hooks/utils/cache/useLocalDB';
import useSignerOrProvider from '../../../hooks/utils/useSignerOrProvider';
import { SafeMultisigTransactionResponse } from '../../../types';
import { useNetworkConfig } from '../../NetworkConfig/NetworkConfigProvider';

class CachingSafeServiceClient extends SafeServiceClient {
  readonly CACHED_MINUTES: number = 1;
  readonly CHAINID: number;

  // holds requests that have yet to return, to avoid calling the same
  // endpoint more than once
  requestMap = new Map<string, Promise<any> | null>();

  constructor(chainId: number, { txServiceUrl, ethAdapter }: SafeServiceClientConfig) {
    super({ txServiceUrl, ethAdapter });
    this.CHAINID = chainId;
  }

  private async setCache(key: string, value: any): Promise<void> {
    await setIndexedDBValue(DBObjectKeys.SAFE_API, key, value, this.CHAINID, this.CACHED_MINUTES);
  }

  private async getCache<T>(key: string): Promise<T> {
    const value: T = await getIndexedDBValue(DBObjectKeys.SAFE_API, key, this.CHAINID);
    return value;
  }

  private async request<T>(cacheKey: string, endpoint: () => Promise<T>): Promise<T> {
    let value: T = await this.getCache<T>(cacheKey);
    if (!value) {
      let call = this.requestMap.get(cacheKey);
      if (!call) {
        call = endpoint();
        this.requestMap.set(cacheKey, call);
      }
      value = await call;
      this.requestMap.set(cacheKey, null);
      await this.setCache(cacheKey, value);
    }
    return value;
  }

  override async getServiceInfo(): Promise<SafeServiceInfoResponse> {
    const value = await this.request('getServiceInfo', super.getServiceInfo);
    return value;
  }
  override async getServiceMasterCopiesInfo(): Promise<MasterCopyResponse[]> {
    const value = await this.request(
      'getServiceMasterCopiesInfo',
      super.getServiceMasterCopiesInfo
    );
    return value;
  }
  override async decodeData(data: string): Promise<any> {
    const value = await this.request('decodeData' + data, () => {
      return super.decodeData(data);
    });
    return value;
  }
  override async getSafesByOwner(ownerAddress: string): Promise<OwnerResponse> {
    const value = await this.request('getSafesByOwner' + ownerAddress, () => {
      return super.getSafesByOwner(ownerAddress);
    });
    return value;
  }
  override async getTransaction(safeTxHash: string): Promise<SafeMultisigTransactionResponse> {
    const value = await this.request('getTransaction' + safeTxHash, () => {
      return super.getTransaction(safeTxHash);
    });
    return value;
  }
  override async getSafeInfo(safeAddress: string): Promise<SafeInfoResponse> {
    const value = await this.request('getSafeInfo' + safeAddress, () => {
      return super.getSafeInfo(safeAddress);
    });
    return value;
  }
  override async getSafeDelegates(safeAddress: string): Promise<SafeDelegateListResponse> {
    const value = await this.request('getSafeDelegates' + safeAddress, () => {
      return super.getSafeDelegates(safeAddress);
    });
    return value;
  }
  override async getSafeCreationInfo(safeAddress: string): Promise<SafeCreationInfoResponse> {
    const value = await this.request('getSafeCreationInfo' + safeAddress, () => {
      return super.getSafeCreationInfo(safeAddress);
    });
    return value;
  }
  override async estimateSafeTransaction(
    safeAddress: string,
    safeTransaction: SafeMultisigTransactionEstimate
  ): Promise<SafeMultisigTransactionEstimateResponse> {
    const value = await this.request(
      'estimateSafeTransaction' + safeAddress + safeTransaction.toString(),
      () => {
        return super.estimateSafeTransaction(safeAddress, safeTransaction);
      }
    );
    return value;
  }
  override async getIncomingTransactions(safeAddress: string): Promise<TransferListResponse> {
    const value = await this.request('getIncomingTransactions' + safeAddress, () => {
      return super.getIncomingTransactions(safeAddress);
    });
    return value;
  }
  override async getModuleTransactions(
    safeAddress: string
  ): Promise<SafeModuleTransactionListResponse> {
    const value = await this.request('getModuleTransactions' + safeAddress, () => {
      return super.getModuleTransactions(safeAddress);
    });
    return value;
  }
  override async getMultisigTransactions(
    safeAddress: string
  ): Promise<SafeMultisigTransactionListResponse> {
    const value = await this.request('getMultisigTransactions' + safeAddress, () => {
      return super.getMultisigTransactions(safeAddress);
    });
    return value;
  }
  override async getPendingTransactions(
    safeAddress: string,
    currentNonce?: number | undefined
  ): Promise<SafeMultisigTransactionListResponse> {
    const value = await this.request(
      'getPendingTransactions' + safeAddress + currentNonce?.toString(),
      () => {
        return super.getPendingTransactions(safeAddress, currentNonce);
      }
    );
    return value;
  }
  override async getNextNonce(safeAddress: string): Promise<number> {
    const value = await this.request('getNextNonce' + safeAddress, () => {
      return super.getNextNonce(safeAddress);
    });
    return value;
  }
  override async getBalances(
    safeAddress: string,
    options?: SafeBalancesOptions | undefined
  ): Promise<SafeBalanceResponse[]> {
    const value = await this.request('getBalances' + safeAddress + options?.toString(), () => {
      return super.getBalances(safeAddress, options);
    });
    return value;
  }
  override async getUsdBalances(
    safeAddress: string,
    options?: SafeBalancesUsdOptions | undefined
  ): Promise<SafeBalanceUsdResponse[]> {
    const value = await this.request('getUsdBalances' + safeAddress + options?.toString(), () => {
      return super.getUsdBalances(safeAddress, options);
    });
    return value;
  }
  override async getCollectibles(
    safeAddress: string,
    options?: SafeCollectiblesOptions | undefined
  ): Promise<SafeCollectibleResponse[]> {
    const value = await this.request('getCollectibles' + safeAddress + options?.toString(), () => {
      return super.getCollectibles(safeAddress, options);
    });
    return value;
  }
  override async getTokenList(): Promise<TokenInfoListResponse> {
    const value = await this.request('getTokenList', () => {
      return super.getTokenList();
    });
    return value;
  }
  override async getToken(tokenAddress: string): Promise<TokenInfoResponse> {
    const value = await this.request('getToken' + tokenAddress, () => {
      return super.getToken(tokenAddress);
    });
    return value;
  }
  override async getAllTransactions(
    safeAddress: string,
    options?: AllTransactionsOptions
  ): Promise<AllTransactionsListResponse> {
    const value = await this.request(
      'getAllTransactions' + safeAddress + options?.toString(),
      () => {
        return super.getAllTransactions(safeAddress, options);
      }
    );
    return value;
  }
  override async getSafesByModule(moduleAddress: string): Promise<ModulesResponse> {
    const value = await this.request('getSafesByModule' + moduleAddress, () => {
      return super.getSafesByModule(moduleAddress);
    });
    return value;
  }
}

export function useSafeAPI() {
  const { safeBaseURL, chainId } = useNetworkConfig();
  const signerOrProvider = useSignerOrProvider();

  const safeAPI: SafeServiceClient = useMemo(() => {
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider,
    });
    return new CachingSafeServiceClient(chainId, {
      txServiceUrl: safeBaseURL,
      ethAdapter,
    });
  }, [signerOrProvider, chainId, safeBaseURL]);

  return safeAPI;
}
