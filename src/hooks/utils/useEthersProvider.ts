import { providers } from 'ethers';
import { useMemo } from 'react';
import type { Transport } from 'viem';
import { usePublicClient } from 'wagmi';

/** Hook to convert a viem Client to an ethers.js Provider. */
export function useEthersProvider() {
  const client = usePublicClient();
  const provider = useMemo(() => {
    if (!client) return new providers.JsonRpcProvider();
    const { transport, chain } = client;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    if (transport.type === 'fallback') {
      return new providers.FallbackProvider(
        (transport.transports as ReturnType<Transport>[]).map(
          ({ value }) => new providers.JsonRpcProvider(value?.url, network)
        )
      );
    }
    return new providers.JsonRpcProvider(transport.url, network);
  }, [client]);
  return provider;
}
