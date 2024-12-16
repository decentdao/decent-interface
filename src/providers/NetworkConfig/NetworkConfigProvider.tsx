import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { NetworkConfig } from '../../types/network';

import { networks } from './networks';

type NetworkConfigContextType = {
  currentConfig: NetworkConfig;
  getConfigByChainId: (chainId: number) => NetworkConfig;
};

export const NetworkConfigContext = createContext<NetworkConfigContextType>(
  {} as NetworkConfigContextType,
);

export const useNetworkConfig = (chainId?: number) => {
  const context = useContext(NetworkConfigContext);
  if (chainId) {
    return context.getConfigByChainId(chainId);
  }
  return context.currentConfig;
};

export const supportedNetworks = Object.values(networks).sort((a, b) => a.order - b.order);
export const moralisSupportedChainIds = supportedNetworks
  .filter(network => network.moralis.chainSupported)
  .map(network => network.chain.id);

export const getNetworkConfig = (chainId: number) => {
  const foundChain = supportedNetworks.find(network => network.chain.id === chainId);
  if (foundChain) {
    return foundChain;
  } else {
    throw new Error(`Can't get network config for chain ${chainId}`);
  }
};

export function NetworkConfigProvider({ children }: { children: ReactNode }) {
  const chainId = useChainId();
  const [currentConfig, setCurrentConfig] = useState<NetworkConfig>(getNetworkConfig(chainId));

  useEffect(() => {
    setCurrentConfig(getNetworkConfig(chainId));
  }, [chainId]);

  const contextValue: NetworkConfigContextType = {
    currentConfig,
    getConfigByChainId: getNetworkConfig,
  };

  return (
    <NetworkConfigContext.Provider value={contextValue}>{children}</NetworkConfigContext.Provider>
  );
}
