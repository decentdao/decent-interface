import { Context, createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Chain, useNetwork } from 'wagmi';
import { NetworkConfig } from '../../types/network';
import { isProd } from '../../utils';
import { sepoliaConfig, mainnetConfig } from './networks';
import { polygonConfig } from './networks/polygon';

export const NetworkConfigContext = createContext({} as NetworkConfig);

export const useNetworkConfig = (): NetworkConfig =>
  useContext(NetworkConfigContext as Context<NetworkConfig>);

// mainnet is first so it defaults to that when disconnected on production
export const supportedChains: NetworkConfig[] = isProd()
  ? [mainnetConfig, sepoliaConfig]
  : [sepoliaConfig, mainnetConfig, polygonConfig];

export const disconnectedChain: Chain = supportedChains[0].wagmiChain;

const getNetworkConfig = (chainId: number) => {
  const foundChain = supportedChains.find(chain => chain.chainId === chainId);
  if (foundChain) {
    return foundChain;
  } else {
    if (isProd()) {
      return mainnetConfig;
    } else {
      return sepoliaConfig;
    }
  }
};

export function NetworkConfigProvider({ children }: { children: ReactNode }) {
  const { chain } = useNetwork();
  const [config, setConfig] = useState<NetworkConfig>(
    getNetworkConfig(chain?.id || disconnectedChain.id),
  );

  useEffect(() => {
    if (chain) {
      setConfig(getNetworkConfig(chain?.id));
    }
  }, [chain]);

  return <NetworkConfigContext.Provider value={config}>{children}</NetworkConfigContext.Provider>;
}
