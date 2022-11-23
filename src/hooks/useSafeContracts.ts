import {
  FractalModule,
  FractalModule__factory,
  FractalNameRegistry,
  FractalNameRegistry__factory,
  VotesToken,
  VotesToken__factory,
} from '@fractal-framework/fractal-contracts';
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
import { useNetworkConfg } from './../providers/NetworkConfig/NetworkConfigProvider';

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
  const [votesMasterCopyContract, setVotesMasterCopyContract] = useState<VotesToken>();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const {
    contracts: {
      gnosisSafe,
      gnosisSafeFactory,
      zodiacModuleProxyFactory,
      linearVotingMasterCopy,
      gnosisMultisend,
      usulMasterCopy,
      fractalModuleMasterCopy,
      fractalNameRegistry,
      votesTokenMasterCopy,
    },
  } = useNetworkConfg();

  useEffect(() => {
    if (!signerOrProvider) {
      setGnosisSafeFactoryContract(undefined);
      setZodiacModuleProxyFactoryContract(undefined);
      setUsulMasterCopyContract(undefined);
      setLinearVotingMasterCopyContract(undefined);
      setGnosisSafeSingletonContract(undefined);
      setFractalModuleMasterCopyContract(undefined);
      setFractalNameRegistryContract(undefined);
      return;
    }

    setMultisendContract(MultiSend__factory.connect(gnosisMultisend, signerOrProvider));
    setGnosisSafeFactoryContract(
      GnosisSafeProxyFactory__factory.connect(gnosisSafeFactory, signerOrProvider)
    );

    setUsulMasterCopyContract(Usul__factory.connect(usulMasterCopy, signerOrProvider));
    setLinearVotingMasterCopyContract(
      OZLinearVoting__factory.connect(linearVotingMasterCopy, signerOrProvider)
    );
    setGnosisSafeSingletonContract(GnosisSafe__factory.connect(gnosisSafe, signerOrProvider));

    setZodiacModuleProxyFactoryContract(
      ModuleProxyFactory__factory.connect(zodiacModuleProxyFactory, signerOrProvider)
    );

    setFractalModuleMasterCopyContract(
      FractalModule__factory.connect(fractalModuleMasterCopy, signerOrProvider)
    );

    setFractalNameRegistryContract(
      FractalNameRegistry__factory.connect(fractalNameRegistry, signerOrProvider)
    );

    setVotesMasterCopyContract(VotesToken__factory.connect(votesTokenMasterCopy, signerOrProvider));
  }, [
    gnosisSafeFactory,
    gnosisSafe,
    zodiacModuleProxyFactory,
    linearVotingMasterCopy,
    usulMasterCopy,
    signerOrProvider,
    gnosisMultisend,
    fractalModuleMasterCopy,
    fractalNameRegistry,
    votesTokenMasterCopy,
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
    votesMasterCopyContract,
  };
}
