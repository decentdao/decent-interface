import { Context, createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Chain, useDisconnect, useNetwork, useProvider } from 'wagmi';
import { NetworkConfig } from '../../types/network';
import { isProd } from '../../utils';
import { goerliConfig, mainnetConfig } from './networks';
import { polygonConfig } from './networks/polygon';

export const NetworkConfigContext = createContext({} as NetworkConfig);

export const useNetworkConfg = (): NetworkConfig =>
  useContext(NetworkConfigContext as Context<NetworkConfig>);

// mainnet is first so it defaults to that when disconnected on production
export const supportedChains: NetworkConfig[] = isProd()
  ? [mainnetConfig, goerliConfig]
  : [goerliConfig, mainnetConfig, polygonConfig];

export const disconnectedChain: Chain = supportedChains[0].wagmiChain;

const getNetworkConfig = (chainId: number) => {
  return supportedChains.find(chain => chain.chainId === chainId) || goerliConfig;
};

export function NetworkConfigProvider({ children }: { children: ReactNode }) {
  const provider = useProvider();
  const { chain } = useNetwork();
  const { t } = useTranslation('menu');
  const { disconnect } = useDisconnect();
  const [config, setConfig] = useState<NetworkConfig>(getNetworkConfig(provider.network.chainId));

  useEffect(() => {
    setConfig(getNetworkConfig(provider.network.chainId));
  }, [provider]);

  useEffect(() => {
    const supportedChainIds = supportedChains.map(c => c.chainId);
    const supportedChainNames = supportedChains.map(c => c.name).join(', ');

    if (
      !!chain &&
      !supportedChainIds.includes(chain.id) &&
      !process.env.NEXT_PUBLIC_TESTING_ENVIROMENT
    ) {
      toast(t('toastSwitchChain', { chainNames: supportedChainNames }), {
        toastId: 'switchChain',
      });
      disconnect();
    }
  }, [chain, disconnect, t]);

  return <NetworkConfigContext.Provider value={config}>{children}</NetworkConfigContext.Provider>;
}
