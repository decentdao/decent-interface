import { providers } from 'ethers';
import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';

/** Hook to convert a Viem Client to an ethers.js Signer. */
export function useEthersSigner() {
  const { data: client } = useWalletClient();
  const signer = useMemo(() => {
    if (client) {
      const { account, chain, transport } = client;
      const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
      };
      const provider = new providers.Web3Provider(transport, network);
      return provider.getSigner(account.address);
    }
  }, [client]);
  return signer;
}
