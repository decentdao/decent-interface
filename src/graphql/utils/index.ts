import { useMemo } from 'react';
import { usePublicClient } from 'wagmi';
import { supportedChains } from '../../providers/NetworkConfig/NetworkConfigProvider';

export const useSubgraphChainName = () => {
  const { chain } = usePublicClient();

  const subgraphChainName = useMemo(() => {
    let chainName = chain.name;
    supportedChains.forEach(supportedChain => {
      if (supportedChain.chainId === chain.id) {
        chainName = supportedChain.subgraphChainName;
      }
    });
    return chainName;
  }, [chain.id, chain.name]);

  return subgraphChainName;
};
