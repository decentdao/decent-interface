import { useState, useEffect } from 'react';
import {
  GnosisSafeProxyFactory__factory,
  GnosisSafeProxyFactory,
} from '../assets/typechain-types/gnosis-safe';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { useAddresses } from './useAddresses';

export default function useSafeContracts() {
  const [gnosisSafeFactoryContract, setGnosisSafeFactoryContract] =
    useState<GnosisSafeProxyFactory>();
  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();

  const { gnosisSafeFactory } = useAddresses(chainId);

  useEffect(() => {
    if (!gnosisSafeFactory || !signerOrProvider) {
      setGnosisSafeFactoryContract(undefined);
      return;
    }

    setGnosisSafeFactoryContract(
      GnosisSafeProxyFactory__factory.connect(gnosisSafeFactory.address, signerOrProvider)
    );
  }, [gnosisSafeFactory, signerOrProvider]);

  return { gnosisSafeFactoryContract };
}
