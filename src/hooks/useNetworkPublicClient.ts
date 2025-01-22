import { useMemo } from 'react';
import { createPublicClient, http } from 'viem';
import { useNetworkConfigStore } from '../providers/NetworkConfig/useNetworkConfigStore';

export default function useNetworkPublicClient() {
  const { chain, rpcEndpoint } = useNetworkConfigStore();
  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain,
        batch: {
          multicall: {
            wait: 200,
          },
        },
        transport: http(rpcEndpoint),
      }),
    [chain, rpcEndpoint],
  );
  return publicClient;
}
