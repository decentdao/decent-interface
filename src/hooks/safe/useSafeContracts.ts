import {
  FractalModule,
  FractalModule__factory,
  FractalNameRegistry,
  FractalNameRegistry__factory,
  VetoERC20Voting,
  VetoERC20Voting__factory,
  VetoGuard,
  VetoGuard__factory,
  VetoMultisigVoting,
  VetoMultisigVoting__factory,
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
  ModuleProxyFactory,
  ModuleProxyFactory__factory,
  OZLinearVoting,
  OZLinearVoting__factory,
  Usul,
  Usul__factory,
} from '../../assets/typechain-types/usul';
import { useNetworkConfg } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';

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
  const [vetoGuardMasterCopyContract, setVetoGuardMasterCopyContract] = useState<VetoGuard>();
  const [vetoMultisigVotingMasterCopyContract, setvetoMultisigVotingMasterCopyContract] =
    useState<VetoMultisigVoting>();
  const [vetoERC20VotingMasterCopyContract, setvetoERC20VotingMasterCopyContract] =
    useState<VetoERC20Voting>();
  const [votesTokenMasterCopyContract, setVotesTokenMasterCopyContract] = useState<VotesToken>();
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
      vetoGuardMasterCopy,
      vetoMultisigVotingMasterCopy,
      vetoERC20VotingMasterCopy,
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
      setVotesTokenMasterCopyContract(undefined);
      setVetoGuardMasterCopyContract(undefined);
      setvetoMultisigVotingMasterCopyContract(undefined);
      setvetoERC20VotingMasterCopyContract(undefined);
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
    setVetoGuardMasterCopyContract(
      VetoGuard__factory.connect(vetoGuardMasterCopy, signerOrProvider)
    );
    setvetoMultisigVotingMasterCopyContract(
      VetoMultisigVoting__factory.connect(vetoMultisigVotingMasterCopy, signerOrProvider)
    );
    setvetoERC20VotingMasterCopyContract(
      VetoERC20Voting__factory.connect(vetoERC20VotingMasterCopy, signerOrProvider)
    );

    setVotesTokenMasterCopyContract(
      VotesToken__factory.connect(votesTokenMasterCopy, signerOrProvider)
    );
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
    vetoGuardMasterCopy,
    vetoMultisigVotingMasterCopy,
    vetoERC20VotingMasterCopy,
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
    vetoGuardMasterCopyContract,
    vetoMultisigVotingMasterCopyContract,
    vetoERC20VotingMasterCopyContract,
    votesTokenMasterCopyContract,
  };
}
