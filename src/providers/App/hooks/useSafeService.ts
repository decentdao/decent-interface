import EthersAdapter from '@safe-global/safe-ethers-lib';
import SafeServiceClient from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { useNetworkConfg } from '../../NetworkConfig/NetworkConfigProvider';

export function useSafeService() {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { safeBaseURL } = useNetworkConfg();

  const safeService = useMemo(() => {
    const signerOrProvider = signer || provider;
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider,
    });

    return new SafeServiceClient({
      txServiceUrl: safeBaseURL,
      ethAdapter,
    });
  }, [provider, signer, safeBaseURL]);

  return safeService;
}
