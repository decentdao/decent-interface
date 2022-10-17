import { useState, useEffect } from 'react';
import {
  GnosisSafeProxyFactory__factory,
  GnosisSafeProxyFactory,
  GnosisSafe__factory,
  GnosisSafe,
} from '../assets/typechain-types/gnosis-safe';
import {
  Usul__factory,
  Usul,
  ModuleProxyFactory__factory,
  ModuleProxyFactory,
  OZLinearVoting__factory,
  OZLinearVoting,
} from '../assets/typechain-types/usul';
import {
  CallbackGnosis,
  CallbackGnosis__factory,
} from '../assets/typechain-types/fractal-contracts';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { useAddresses } from './useAddresses';

export default function useSafeContracts() {
  const [callbackGnosisSafeFactoryContract, setCallbackGnosisSafeFactoryContract] =
    useState<CallbackGnosis>();
  const [gnosisSafeFactoryContract, setGnosisSafeFactoryContract] =
    useState<GnosisSafeProxyFactory>();
  const [gnosisSafeSingletonContract, setGnosisSafeSingletonContract] = useState<GnosisSafe>();
  const [zodiacModuleProxyFactoryContract, setZodiacModuleProxyFactoryContract] =
    useState<ModuleProxyFactory>();
  const [usulMastercopyContract, setUsulMastercopyContract] = useState<Usul>();
  const [linearVotingMastercopyContract, setLinearVotingMastercopyContract] =
    useState<OZLinearVoting>(); // 1:1 Token Voting contract
  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();

  const {
    gnosisSafe,
    gnosisSafeFactory,
    zodiacModuleProxyFactory,
    linearVotingMastercopy,
    usulMastercopy,
    callbackGnosisSafe,
  } = useAddresses(chainId);

  useEffect(() => {
    if (
      !gnosisSafeFactory ||
      !zodiacModuleProxyFactory ||
      !linearVotingMastercopy ||
      !usulMastercopy ||
      !gnosisSafe ||
      !callbackGnosisSafe ||
      !signerOrProvider
    ) {
      setGnosisSafeFactoryContract(undefined);
      setZodiacModuleProxyFactoryContract(undefined);
      setUsulMastercopyContract(undefined);
      setLinearVotingMastercopyContract(undefined);
      setGnosisSafeSingletonContract(undefined);
      return;
    }

    setCallbackGnosisSafeFactoryContract(
      CallbackGnosis__factory.connect(callbackGnosisSafe.address, signerOrProvider)
    );
    setGnosisSafeFactoryContract(
      GnosisSafeProxyFactory__factory.connect(gnosisSafeFactory.address, signerOrProvider)
    );

    setUsulMastercopyContract(Usul__factory.connect(usulMastercopy.address, signerOrProvider));
    setLinearVotingMastercopyContract(
      OZLinearVoting__factory.connect(linearVotingMastercopy.address, signerOrProvider)
    );
    setGnosisSafeSingletonContract(
      GnosisSafe__factory.connect(gnosisSafe.address, signerOrProvider)
    );

    setZodiacModuleProxyFactoryContract(
      ModuleProxyFactory__factory.connect(zodiacModuleProxyFactory.address, signerOrProvider)
    );
  }, [
    gnosisSafeFactory,
    gnosisSafe,
    zodiacModuleProxyFactory,
    linearVotingMastercopy,
    usulMastercopy,
    signerOrProvider,
    callbackGnosisSafe,
  ]);

  return {
    gnosisSafeFactoryContract,
    gnosisSafeSingletonContract,
    zodiacModuleProxyFactoryContract,
    usulMastercopyContract,
    linearVotingMastercopyContract,
    callbackGnosisSafeFactoryContract,
  };
}
