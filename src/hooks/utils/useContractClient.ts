import { useMemo } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';

export default function useContractClient() {
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const walletOrPublicClient = useMemo(() => {
    if (walletClient.data) {
      return walletClient.data;
    }
    return publicClient;
  }, [walletClient.data, publicClient]);

  return {
    publicClient,
    walletClient: walletClient.data,
    walletOrPublicClient,
  };
}
