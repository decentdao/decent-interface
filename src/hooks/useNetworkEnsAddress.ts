import { useCallback } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { useEnsAddress } from 'wagmi';
import {
  supportedEnsNetworks,
  useNetworkConfigStore,
} from '../providers/NetworkConfig/useNetworkConfigStore';

interface UseNetworkEnsAddressProps {
  chainId?: number;
  name?: string;
}

export function useNetworkEnsAddress(props?: UseNetworkEnsAddressProps) {
  const { chain } = useNetworkConfigStore();
  const propsOrFallbackChainId = props?.chainId ?? chain.id;

  if (!supportedEnsNetworks.includes(propsOrFallbackChainId)) {
    throw new Error(`ENS is not supported for chain ${propsOrFallbackChainId}`);
  }

  return useEnsAddress({ name: props?.name, chainId: propsOrFallbackChainId });
}

export function useNetworkEnsAddressAsync() {
  const { chain, getConfigByChainId } = useNetworkConfigStore();

  const getEnsAddress = useCallback(
    (args: { name: string; chainId?: number }) => {
      const ensNetworkOrMainnet = supportedEnsNetworks.includes(args?.chainId ?? chain.id)
        ? chain.id
        : mainnet.id;

      const networkConfig = getConfigByChainId(ensNetworkOrMainnet);
      const publicClient = createPublicClient({
        chain: networkConfig.chain,
        transport: http(networkConfig.rpcEndpoint),
      });
      return publicClient.getEnsAddress({ name: args.name });
    },
    [chain, getConfigByChainId],
  );

  return { getEnsAddress };
}
