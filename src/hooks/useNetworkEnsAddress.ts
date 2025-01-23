import { useCallback } from 'react';
import { mainnet } from 'viem/chains';
import { useEnsAddress } from 'wagmi';
import {
  supportedEnsNetworks,
  useNetworkConfigStore,
} from '../providers/NetworkConfig/useNetworkConfigStore';
import useNetworkPublicClient from './useNetworkPublicClient';

interface UseNetworkEnsAddressProps {
  name?: string;
  chainId?: number;
}

export function useNetworkEnsAddress(props?: UseNetworkEnsAddressProps) {
  const { chain } = useNetworkConfigStore();
  const ensNetworkOrMainnet = supportedEnsNetworks.includes(props?.chainId ?? chain.id)
    ? chain.id
    : mainnet.id;

  return useEnsAddress({ name: props?.name, chainId: ensNetworkOrMainnet });
}

export function useNetworkEnsAddressAsync(props?: UseNetworkEnsAddressProps) {
  const { chain } = useNetworkConfigStore();
  const ensNetworkOrMainnet = supportedEnsNetworks.includes(props?.chainId ?? chain.id)
    ? chain.id
    : mainnet.id;

  const publicClient = useNetworkPublicClient({
    chainId: ensNetworkOrMainnet,
  });

  const getEnsAddress = useCallback(
    (args: { name: string }) => {
      return publicClient.getEnsAddress({ name: args.name });
    },
    [publicClient],
  );

  return { getEnsAddress };
}
