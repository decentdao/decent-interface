import { useCallback } from 'react';
import { Address, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { useEnsName } from 'wagmi';
import {
  supportedEnsNetworks,
  useNetworkConfigStore,
} from '../providers/NetworkConfig/useNetworkConfigStore';

interface UseNetworkEnsNameProps {
  address?: Address;
  chainId?: number;
}

export function useNetworkEnsName(props?: UseNetworkEnsNameProps) {
  const { chain } = useNetworkConfigStore();
  const propsOrFallbackChainId = props?.chainId ?? chain.id;

  if (!supportedEnsNetworks.includes(propsOrFallbackChainId)) {
    throw new Error(`ENS is not supported for chain ${propsOrFallbackChainId}`);
  }

  return useEnsName({ address: props?.address, chainId: propsOrFallbackChainId });
}

export function useNetworkEnsNameAsync() {
  const { chain, getConfigByChainId } = useNetworkConfigStore();

  const getEnsName = useCallback(
    (args: { address: Address; chainId?: number }) => {
      let effectiveChainId: number;

      if (args.chainId !== undefined) {
        if (!supportedEnsNetworks.includes(args.chainId)) {
          throw new Error(`ENS is not supported for chain ${args.chainId}`);
        }
        effectiveChainId = args.chainId;
      } else {
        // No chain id provided: try to use network chain id, otherwise fallback to mainnet.
        effectiveChainId = supportedEnsNetworks.includes(chain.id) ? chain.id : mainnet.id;
      }

      const networkConfig = getConfigByChainId(effectiveChainId);
      const publicClient = createPublicClient({
        chain: networkConfig.chain,
        transport: http(networkConfig.rpcEndpoint),
      });
      return publicClient.getEnsName({ address: args.address });
    },
    [chain, getConfigByChainId],
  );

  return { getEnsName };
}
