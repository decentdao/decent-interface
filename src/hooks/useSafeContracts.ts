import { useState, useEffect } from 'react';
import {
  GnosisSafeProxyFactory__factory,
  GnosisSafeProxyFactory,
} from '../assets/typechain-types/gnosis-safe';
import {
  Usul__factory,
  Usul,
  ModuleProxyFactory__factory,
  ModuleProxyFactory,
} from '../assets/typechain-types/usul';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { useAddresses } from './useAddresses';

export default function useSafeContracts() {
  const [gnosisSafeFactoryContract, setGnosisSafeFactoryContract] =
    useState<GnosisSafeProxyFactory>();
  const [usulMastercopyContract, setUsulMastercopyContract] = useState<Usul>();
  const [zodiacModuleProxyFactoryContract, setZodiacModuleProxyFactoryContract] =
    useState<ModuleProxyFactory>();
  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();

  const { gnosisSafeFactory, usulMastercopy, zodiacModuleProxyFactory } = useAddresses(chainId);

  useEffect(() => {
    if (!gnosisSafeFactory || !zodiacModuleProxyFactory || !usulMastercopy || !signerOrProvider) {
      setGnosisSafeFactoryContract(undefined);
      setZodiacModuleProxyFactoryContract(undefined);
      setUsulMastercopyContract(undefined);
      return;
    }

    setGnosisSafeFactoryContract(
      GnosisSafeProxyFactory__factory.connect(gnosisSafeFactory.address, signerOrProvider)
    );

    setZodiacModuleProxyFactoryContract(
      ModuleProxyFactory__factory.connect(zodiacModuleProxyFactory.address, signerOrProvider)
    );

    setUsulMastercopyContract(Usul__factory.connect(usulMastercopy.address, signerOrProvider));
  }, [gnosisSafeFactory, zodiacModuleProxyFactory, usulMastercopy, signerOrProvider]);

  return { gnosisSafeFactoryContract, usulMastercopyContract, zodiacModuleProxyFactoryContract };
}
