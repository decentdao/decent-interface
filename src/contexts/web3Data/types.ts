import { ethers } from 'ethers';

export type ConnectFn = () => Promise<void>;
export type DisconnectFn = () => void;
export type Providers =
  | ethers.providers.Web3Provider
  | ethers.providers.JsonRpcProvider
  | ethers.providers.BaseProvider;

export interface InitialState {
  wallet: Wallet;
  provider: Providers | null;
  connection: ConnectionInfo;
  isProviderLoading: boolean;
}

export type Wallet = {
  account: string | null;
  signer: ethers.Signer | null;
};

export type ConnectionInfo = {
  name: string;
  network: string;
  chainId: number;
};

export type InjectedProviderInfo = {
  wallet: {
    account: string;
    signer: ethers.Signer;
  };
  provider: ethers.providers.Web3Provider;
  connection: {
    name: string;
    network: string;
    chainId: number;
  };
};

export type BaseProviderInfo = {
  provider: Providers;
  connection: {
    name: string;
    network: string;
    chainId: number;
  };
};

export type ProviderApiKeys = {
  infura?: string;
  alchemy?: string;
  etherscan?: string;
};
