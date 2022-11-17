import {
  FractalModule,
  FractalModule__factory,
  FractalNameRegistry,
  FractalNameRegistry__factory,
} from '@fractal-framework/fractal-contracts/dist/typechain-types';
import { useEffect, useState } from 'react';
import {
  GnosisSafe,
  GnosisSafeProxyFactory,
  GnosisSafeProxyFactory__factory,
  GnosisSafe__factory,
  MultiSend,
  MultiSend__factory,
} from '../assets/typechain-types/gnosis-safe';
import {
  ModuleProxyFactory,
  ModuleProxyFactory__factory,
  OZLinearVoting,
  OZLinearVoting__factory,
  Usul,
  Usul__factory,
} from '../assets/typechain-types/usul';
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
  const [fractalNameRegistryContract, setFractalNameRegistryContract] =
    useState<FractalNameRegistry>();
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
    fractalNameRegistry,
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
      !fractalNameRegistry ||
      !signerOrProvider
    ) {
      setGnosisSafeFactoryContract(undefined);
      setZodiacModuleProxyFactoryContract(undefined);
      setUsulMasterCopyContract(undefined);
      setLinearVotingMasterCopyContract(undefined);
      setGnosisSafeSingletonContract(undefined);
      setFractalModuleMasterCopyContract(undefined);
      setFractalNameRegistryContract(undefined);
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

    setFractalNameRegistryContract(
      FractalNameRegistry__factory.connect(fractalNameRegistry.address, signerOrProvider)
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
    fractalNameRegistry,
  ]);

  return {
    gnosisSafeFactoryContract,
    gnosisSafeSingletonContract,
    zodiacModuleProxyFactoryContract,
    usulMasterCopyContract,
    linearVotingMasterCopyContract,
    multiSendContract,
    fractalModuleMasterCopyContract,
    fractalNameRegistryContract,
  };
}
