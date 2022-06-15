import { ethers } from 'ethers';

export type ConnectFn = () => Promise<void>;
export type DisconnectFn = () => void;
export type Providers =
  | ethers.providers.Web3Provider
  | ethers.providers.JsonRpcProvider
  | ethers.providers.BaseProvider;

export interface InitialState {
  connectionType: string;
  network: string;
  chainId: number;
  provider: Providers | null;
  account: string | null;
  signer: ethers.Signer | null;
}

export type InjectedProviderInfo = {
  account: string;
  signer: ethers.Signer;
  provider: ethers.providers.Web3Provider;
  connectionType: string;
  network: string;
  chainId: number;
};

export type BaseProviderInfo = {
  provider: Providers;
  connectionType: string;
  network: string;
  chainId: number;
};

export type ProviderApiKeys = {
  infura?: string;
  alchemy?: string;
  etherscan?: string;
};
