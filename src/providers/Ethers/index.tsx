'use client';

import { Signer, providers } from 'ethers';
import { ReactNode, createContext, useMemo } from 'react';
import type { Transport } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';

interface IEthersContext {
  provider?: providers.JsonRpcProvider | providers.FallbackProvider;
  signer?: Signer;
}

export const EthersContext = createContext<IEthersContext>({
  provider: undefined,
  signer: undefined,
});

/**
 * Provider to convert a viem Clients to an ethers.js Provider and Signer
 * and supply "singleton" instances of it to underlying components.
 */
export default function EthersContextProvider({ children }: { children: ReactNode }) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const provider = useMemo(() => {
    const { chain, transport } = publicClient;
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
  }, [publicClient]);

  const signer = useMemo(() => {
    if (walletClient) {
      const { account, chain, transport } = walletClient;
      const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
      };
      const publicProvider = new providers.Web3Provider(transport, network);
      return publicProvider.getSigner(account.address);
    }
  }, [walletClient]);

  return <EthersContext.Provider value={{ provider, signer }}>{children}</EthersContext.Provider>;
}
