import { useMemo } from 'react';
import { useProvider } from 'wagmi';
import { supportedChains } from '../../providers/NetworkConfig/NetworkConfigProvider';

export const useSubgraphChainName = () => {
  const provider = useProvider();

  const subgraphChainName = useMemo(() => {
    supportedChains.forEach(chain => {
      if (chain.chainId === provider.network.chainId) {
        return chain.subgraphChainName;
      }
    });
    return provider.network.name;
  }, [provider]);

  return subgraphChainName;
};
