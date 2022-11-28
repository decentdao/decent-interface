import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';

export type ConnectFn = () => Promise<void>;
export type DisconnectFn = () => void;
export type Providers =
  | ethers.providers.Web3Provider
  | ethers.providers.JsonRpcProvider
  | ethers.providers.BaseProvider;

export type ModalProvider = ethers.providers.Web3Provider | WalletConnectProvider;

export interface InitialState {
  connectionType: string;
  network: string;
  chainId: number;
  provider: Providers | null;
  account: string | null;
  signerOrProvider: ethers.Signer | Providers | null;
  isProviderLoading: boolean;
}

export type InjectedProviderInfo = {
  account: string;
  signerOrProvider: ethers.Signer;
  provider: ethers.providers.Web3Provider;
  connectionType: string;
  network: string;
  chainId: number;
};

export type LocalInjectedProviderInfo = {
  account: string | null;
  signerOrProvider: ethers.providers.JsonRpcSigner | ethers.providers.JsonRpcProvider;
  provider: ethers.providers.JsonRpcProvider;
  connectionType: string;
  network: string;
  chainId: number;
};

export type BaseProviderInfo = {
  provider: Providers;
  signerOrProvider: ethers.Signer | Providers;
  connectionType: string;
  network: string;
  chainId: number;
};

export type ProviderApiKeys = {
  infura?: string;
  alchemy?: string;
  etherscan?: string;
};

export interface Web3ModalProvider {
  _isProvider: boolean;
  _events: [];
  _emitted: {
    block: number;
  };
  disableCcipRead: false;
  formatter: {
    formats: {
      transaction: {};
      transactionRequest: {};
      receiptLog: {};
      receipt: {};
      block: {};
      blockWithTransactions: {};
      filter: {};
      filterLog: {};
    };
  };
  anyNetwork: false;
  _networkPromise: {};
  _maxInternalBlockNumber: number;
  _lastBlockNumber: number;
  _maxFilterBlockRange: number;
  _pollingInterval: number;
  _fastQueryDate: number;
  connection: {
    url: string;
  };
  _nextId: 43;
  _eventLoopCache: {
    detectNetwork: null;
    eth_chainId: null;
  };
  chainId: 31337;
  name: unknown;
}
