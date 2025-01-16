import { createPublicClient, http } from 'viem';
import { useNetworkConfigStore } from '../providers/NetworkConfig/useNetworkConfigStore';

export default function useNetworkPublicClient() {
  const { chain, rpcEndpoint } = useNetworkConfigStore();
  return createPublicClient({
    chain,
    batch: {
      multicall: true,
    },
    transport: http(rpcEndpoint),
  });
}
