import { Context, createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { NetworkConfig } from '../../types/network';

const modules = import.meta.glob<{ default: NetworkConfig }>('./networks/*.ts', { eager: true });
const networks = Object.values(modules).map(module => module.default);

export const NetworkConfigContext = createContext({} as NetworkConfig);

export const useNetworkConfig = (): NetworkConfig =>
  useContext(NetworkConfigContext as Context<NetworkConfig>);

export const supportedNetworks = Object.values(networks).sort((a, b) => a.order - b.order);
export const moralisSupportedChainIds = supportedNetworks
  .filter(network => network.moralisSupported)
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
  const [config, setConfig] = useState<NetworkConfig>(getNetworkConfig(chainId));

  useEffect(() => {
    setConfig(getNetworkConfig(chainId));
  }, [chainId]);

  return <NetworkConfigContext.Provider value={config}>{children}</NetworkConfigContext.Provider>;
}
