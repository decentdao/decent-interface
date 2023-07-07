import { useMemo } from 'react';
import { useProvider } from 'wagmi';
import { supportedChains } from '../../providers/NetworkConfig/NetworkConfigProvider';

export const useSubgraphChainName = () => {
  const provider = useProvider();

  const subgraphChainName = useMemo(() => {
    let chainName = provider.network.name;
    supportedChains.forEach(chain => {
      if (chain.chainId === provider.network.chainId) {
        chainName = chain.subgraphChainName;
      }
    });
    return chainName;
  }, [provider]);

  return subgraphChainName;
};
