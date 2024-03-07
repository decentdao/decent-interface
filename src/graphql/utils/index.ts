import { useMemo } from 'react';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';
import { supportedChains } from '../../providers/NetworkConfig/NetworkConfigProvider';

export const useSubgraphChainName = () => {
  const provider = useEthersProvider();

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
