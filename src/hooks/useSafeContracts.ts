import { useState, useEffect } from 'react';
import {
  GnosisSafeProxyFactory__factory,
  GnosisSafeProxyFactory,
  GnosisSafe__factory,
  GnosisSafe,
  MultiSend,
  MultiSend__factory,
} from '../assets/typechain-types/gnosis-safe';
import {
  Usul__factory,
  Usul,
  ModuleProxyFactory__factory,
  ModuleProxyFactory,
  OZLinearVoting__factory,
  OZLinearVoting,
} from '../assets/typechain-types/usul';
import { FractalModule, FractalModule__factory } from '../assets/typechain-types/fractal-contracts';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { useAddresses } from './useAddresses';

export default function useSafeContracts() {
  const [multiSendContract, setMultisendContract] = useState<MultiSend>();
  const [gnosisSafeFactoryContract, setGnosisSafeFactoryContract] =
    useState<GnosisSafeProxyFactory>();
  const [gnosisSafeSingletonContract, setGnosisSafeSingletonContract] = useState<GnosisSafe>();
  const [zodiacModuleProxyFactoryContract, setZodiacModuleProxyFactoryContract] =
    useState<ModuleProxyFactory>();
  const [usulMasterCopyContract, setUsulMasterCopyContract] = useState<Usul>();
  const [linearVotingMasterCopyContract, setLinearVotingMasterCopyContract] =
    useState<OZLinearVoting>(); // 1:1 Token Voting contract
  const [fractalModuleMasterCopyContract, setFractalModuleMasterCopyContract] =
    useState<FractalModule>();
  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();

  const {
    gnosisSafe,
    gnosisSafeFactory,
    zodiacModuleProxyFactory,
    linearVotingMasterCopy,
    usulMasterCopy,
    multiSend,
    fractalModuleMasterCopy,
  } = useAddresses(chainId);

  useEffect(() => {
    if (
      !gnosisSafeFactory ||
      !zodiacModuleProxyFactory ||
      !linearVotingMasterCopy ||
      !usulMasterCopy ||
      !gnosisSafe ||
      !multiSend ||
      !fractalModuleMasterCopy ||
      !signerOrProvider
    ) {
      setGnosisSafeFactoryContract(undefined);
      setZodiacModuleProxyFactoryContract(undefined);
      setUsulMasterCopyContract(undefined);
      setLinearVotingMasterCopyContract(undefined);
      setGnosisSafeSingletonContract(undefined);
      setFractalModuleMasterCopyContract(undefined);
      return;
    }

    setMultisendContract(MultiSend__factory.connect(multiSend.address, signerOrProvider));
    setGnosisSafeFactoryContract(
      GnosisSafeProxyFactory__factory.connect(gnosisSafeFactory.address, signerOrProvider)
    );

    setUsulMasterCopyContract(Usul__factory.connect(usulMasterCopy.address, signerOrProvider));
    setLinearVotingMasterCopyContract(
      OZLinearVoting__factory.connect(linearVotingMasterCopy.address, signerOrProvider)
    );
    setGnosisSafeSingletonContract(
      GnosisSafe__factory.connect(gnosisSafe.address, signerOrProvider)
    );

    setZodiacModuleProxyFactoryContract(
      ModuleProxyFactory__factory.connect(zodiacModuleProxyFactory.address, signerOrProvider)
    );

    setFractalModuleMasterCopyContract(
      FractalModule__factory.connect(fractalModuleMasterCopy.address, signerOrProvider)
    );
  }, [
    gnosisSafeFactory,
    gnosisSafe,
    zodiacModuleProxyFactory,
    linearVotingMasterCopy,
    usulMasterCopy,
    signerOrProvider,
    multiSend,
    fractalModuleMasterCopy,
  ]);

  return {
    gnosisSafeFactoryContract,
    gnosisSafeSingletonContract,
    zodiacModuleProxyFactoryContract,
    usulMasterCopyContract,
    linearVotingMasterCopyContract,
    multiSendContract,
    fractalModuleMasterCopyContract,
  };
}
