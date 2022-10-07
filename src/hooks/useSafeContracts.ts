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

interface IUseSafeContracts {
  usulAddress?: string;
}

export default function useSafeContracts({ usulAddress }: IUseSafeContracts) {
  const [gnosisSafeFactoryContract, setGnosisSafeFactoryContract] =
    useState<GnosisSafeProxyFactory>();
  const [usulContract, setUsulContract] = useState<Usul>();
  const [zodiacModuleProxyFactoryContract, setZodiacModuleProxyFactoryContract] =
    useState<ModuleProxyFactory>();
  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();

  const { gnosisSafeFactory, zodiacModuleProxyFactory } = useAddresses(chainId);

  useEffect(() => {
    if (!gnosisSafeFactory || !zodiacModuleProxyFactory || !signerOrProvider) {
      setGnosisSafeFactoryContract(undefined);
      setZodiacModuleProxyFactoryContract(undefined);
      return;
    }

    setGnosisSafeFactoryContract(
      GnosisSafeProxyFactory__factory.connect(gnosisSafeFactory.address, signerOrProvider)
    );

    setZodiacModuleProxyFactoryContract(
      ModuleProxyFactory__factory.connect(zodiacModuleProxyFactory.address, signerOrProvider)
    );
  }, [gnosisSafeFactory, zodiacModuleProxyFactory, signerOrProvider]);

  useEffect(() => {
    if (usulAddress && signerOrProvider) {
      setUsulContract(Usul__factory.connect(usulAddress, signerOrProvider));
    }
  }, [usulAddress, signerOrProvider]);

  return { gnosisSafeFactoryContract, usulContract, zodiacModuleProxyFactoryContract };
}
