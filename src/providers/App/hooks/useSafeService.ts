import EthersAdapter from '@safe-global/safe-ethers-lib';
import SafeServiceClient from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import useSignerOrProvider from '../../../hooks/utils/useSignerOrProvider';
import { useNetworkConfig } from '../../NetworkConfig/NetworkConfigProvider';

export function useSafeService() {
  const { safeBaseURL } = useNetworkConfig();
  const signerOrProvider = useSignerOrProvider();

  const safeService = useMemo(() => {
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider,
    });

    return new SafeServiceClient({
      txServiceUrl: safeBaseURL,
      ethAdapter,
    });
  }, [signerOrProvider, safeBaseURL]);

  return safeService;
}
