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
  OZLinearVoting__factory,
  OZLinearVoting,
} from '../assets/typechain-types/usul';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { useAddresses } from './useAddresses';

interface IUseSafeContracts {
  usulAddress?: string;
  linearVotingAddress?: string;
}

export default function useSafeContracts({ usulAddress, linearVotingAddress }: IUseSafeContracts) {
  const [gnosisSafeFactoryContract, setGnosisSafeFactoryContract] =
    useState<GnosisSafeProxyFactory>();
  const [zodiacModuleProxyFactoryContract, setZodiacModuleProxyFactoryContract] =
    useState<ModuleProxyFactory>();
  const [usulContract, setUsulContract] = useState<Usul>();
  const [linearVotingContract, setLinearVotingContract] = useState<OZLinearVoting>(); // 1:1 Token Voting contract
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
    if (!usulAddress || !signerOrProvider) {
      setUsulContract(undefined);
      return;
    }
    setUsulContract(Usul__factory.connect(usulAddress, signerOrProvider));
  }, [usulAddress, signerOrProvider]);

  useEffect(() => {
    if (!linearVotingAddress || !signerOrProvider) {
      setLinearVotingContract(undefined);
      return;
    }
    setLinearVotingContract(OZLinearVoting__factory.connect(linearVotingAddress, signerOrProvider));
  }, [linearVotingAddress, signerOrProvider]);

  return {
    gnosisSafeFactoryContract,
    zodiacModuleProxyFactoryContract,
    usulContract,
    linearVotingContract,
  };
}
