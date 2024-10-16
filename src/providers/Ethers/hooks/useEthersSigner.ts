import { providers } from 'ethers';
import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';

export function useEthersSigner() {
  const { data: walletClient } = useWalletClient();

  const signer = useMemo(() => {
    if (!walletClient) {
      return undefined;
    }

    const web3Provider = new providers.Web3Provider(walletClient.transport);
    const jsonRpcSigner = web3Provider.getSigner(walletClient.account.address);
    return jsonRpcSigner;
  }, [walletClient]);

  return signer;
}
