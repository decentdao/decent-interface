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

export default function useSafeContracts() {
  const [gnosisSafeFactoryContract, setGnosisSafeFactoryContract] =
    useState<GnosisSafeProxyFactory>();
  const [zodiacModuleProxyFactoryContract, setZodiacModuleProxyFactoryContract] =
    useState<ModuleProxyFactory>();
  const [usulMastercopyContract, setUsulMastercopyContract] = useState<Usul>();
  const [linearVotingMastercopyContract, setLinearVotingMastercopyContract] =
    useState<OZLinearVoting>(); // 1:1 Token Voting contract
  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();

  const { gnosisSafeFactory, zodiacModuleProxyFactory, linearVotingMastercopy, usulMastercopy } =
    useAddresses(chainId);

  useEffect(() => {
    if (
      !gnosisSafeFactory ||
      !zodiacModuleProxyFactory ||
      !linearVotingMastercopy ||
      !usulMastercopy ||
      !signerOrProvider
    ) {
      setGnosisSafeFactoryContract(undefined);
      setZodiacModuleProxyFactoryContract(undefined);
      setUsulMastercopyContract(undefined);
      setLinearVotingMastercopyContract(undefined);
      return;
    }

    setGnosisSafeFactoryContract(
      GnosisSafeProxyFactory__factory.connect(gnosisSafeFactory.address, signerOrProvider)
    );

    setUsulMastercopyContract(Usul__factory.connect(usulMastercopy.address, signerOrProvider));
    setLinearVotingMastercopyContract(
      OZLinearVoting__factory.connect(linearVotingMastercopy.address, signerOrProvider)
    );
    setZodiacModuleProxyFactoryContract(
      ModuleProxyFactory__factory.connect(zodiacModuleProxyFactory.address, signerOrProvider)
    );
  }, [
    gnosisSafeFactory,
    zodiacModuleProxyFactory,
    linearVotingMastercopy,
    usulMastercopy,
    signerOrProvider,
  ]);

  return {
    gnosisSafeFactoryContract,
    zodiacModuleProxyFactoryContract,
    usulMastercopyContract,
    linearVotingMastercopyContract,
  };
}
