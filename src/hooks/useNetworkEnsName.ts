import { useCallback } from 'react';
import { Address } from 'viem';
import { useEnsName } from 'wagmi';
import {
  supportedEnsNetworks,
  useNetworkConfigStore,
} from '../providers/NetworkConfig/useNetworkConfigStore';
import useNetworkPublicClient from './useNetworkPublicClient';

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

export function useNetworkEnsNameAsync(props?: UseNetworkEnsNameProps) {
  const { chain } = useNetworkConfigStore();
  const ensNetworkOrMainnet = supportedEnsNetworks.includes(props?.chainId ?? chain.id)
    ? chain.id
    : mainnet.id;

  const publicClient = useNetworkPublicClient({
    chainId: ensNetworkOrMainnet,
  });

  const getEnsName = useCallback(
    (args: { address: Address }) => {
      return publicClient.getEnsName({ address: args.address });
    },
    [publicClient],
  );

  return { getEnsName };
}
