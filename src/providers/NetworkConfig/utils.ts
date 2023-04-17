import { InfuraProvider } from '@ethersproject/providers';
import { useMemo } from 'react';
import { useNetworkConfg } from './NetworkConfigProvider';

export const useEIP1193Providers = () => {
  const { chainId } = useNetworkConfg();

  // Unfortunately, useProvider from wagmi package does not return instance that compatible with EIP1193 standard
  // And that's required for Proxy Detection
  const eip1193InfuraProvider = useMemo(
    () => new InfuraProvider(chainId, process.env.NEXT_PUBLIC_INFURA_API_KEY!),
    [chainId]
  );

  return { eip1193InfuraProvider };
};
