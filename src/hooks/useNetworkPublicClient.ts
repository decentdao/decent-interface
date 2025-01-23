import { useMemo } from 'react';
import { createPublicClient, http } from 'viem';
import { useNetworkConfigStore } from '../providers/NetworkConfig/useNetworkConfigStore';
interface UseNetworkPublicClientProps {
  chainId?: number;
}
export default function useNetworkPublicClient(props?: UseNetworkPublicClientProps) {
  const { chain, rpcEndpoint, getConfigByChainId } = useNetworkConfigStore();
  const chainToUse = props?.chainId ? getConfigByChainId(props.chainId).chain : chain;

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: chainToUse,
        batch: {
          multicall: {
            wait: 200,
          },
        },
        transport: http(rpcEndpoint),
      }),
    [chainToUse, rpcEndpoint],
  );
  return publicClient;
}
