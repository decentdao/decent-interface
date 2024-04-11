import { Context, createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { NetworkConfig } from '../../types/network';
import {
  sepoliaConfig,
  mainnetConfig,
  polygonConfig,
  baseSepoliaConfig,
  baseConfig,
} from './networks';

export const NetworkConfigContext = createContext({} as NetworkConfig);

export const useNetworkConfig = (): NetworkConfig =>
  useContext(NetworkConfigContext as Context<NetworkConfig>);

export const supportedChains: NetworkConfig[] = [
  mainnetConfig,
  sepoliaConfig,
  polygonConfig,
  baseSepoliaConfig,
  baseConfig,
];

const getNetworkConfig = (chainId: number) => {
  const foundChain = supportedChains.find(chain => chain.chainId === chainId);
  if (foundChain) {
    return foundChain;
  } else {
    throw new Error(`Can't get network config for chain ${chainId}`);
  }
};

export function NetworkConfigProvider({ children }: { children: ReactNode }) {
  const chainId = useChainId();
  const [config, setConfig] = useState<NetworkConfig>(getNetworkConfig(chainId));

  useEffect(() => {
    setConfig(getNetworkConfig(chainId));
  }, [chainId]);

  return <NetworkConfigContext.Provider value={config}>{children}</NetworkConfigContext.Provider>;
}
