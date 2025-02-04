import { useCallback } from 'react';
import { Address, createPublicClient, http } from 'viem';
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

  let effectiveChainId: number;

  if (props?.chainId !== undefined) {
    if (!supportedEnsNetworks.includes(props.chainId)) {
      throw new Error(`ENS is not supported for chain ${props.chainId}`);
    }
    effectiveChainId = props.chainId;
  } else {
    // No explicit chainId: use network chain id if supported, otherwise fallback to mainnet.
    effectiveChainId = supportedEnsNetworks.includes(chain.id) ? chain.id : mainnet.id;
  }

  return useEnsName({ address: props?.address, chainId: effectiveChainId });
}

export function useNetworkEnsNameAsync() {
  const { chain, getConfigByChainId } = useNetworkConfigStore();

  const getEnsName = useCallback(
    (args: { address: Address; chainId?: number }) => {
      const propsOrFallbackChainId = args?.chainId ?? chain.id;
      if (!supportedEnsNetworks.includes(propsOrFallbackChainId)) {
        throw new Error(`ENS is not supported for chain ${propsOrFallbackChainId}`);
      }

      const networkConfig = getConfigByChainId(propsOrFallbackChainId);
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
