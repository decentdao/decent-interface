import { ethers } from 'ethers';

export type ConnectFn = () => null;
export type DisconnectFn = () => null;

export interface InitialState {
  wallet: Wallet;
  provider: ethers.providers.BaseProvider | null;
  isCacheProvider?: boolean;
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
  provider: ethers.providers.BaseProvider;
  connection: {
    name: string;
    network: string;
    chainId: number;
  };
};

export type BaseProviderInfo = {
  provider: ethers.providers.BaseProvider;
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
