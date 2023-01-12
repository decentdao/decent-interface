import {
  FractalModule,
  FractalModule__factory,
  FractalRegistry,
  FractalRegistry__factory,
  UsulVetoGuard,
  UsulVetoGuard__factory,
  VetoERC20Voting,
  VetoERC20Voting__factory,
  VetoGuard,
  VetoGuard__factory,
  VetoMultisigVoting,
  VetoMultisigVoting__factory,
  VotesToken,
  VotesToken__factory,
  GnosisSafe,
  GnosisSafeProxyFactory,
  GnosisSafeProxyFactory__factory,
  GnosisSafe__factory,
  ModuleProxyFactory,
  ModuleProxyFactory__factory,
  OZLinearVoting,
  OZLinearVoting__factory,
  FractalUsul,
  FractalUsul__factory,
} from '@fractal-framework/fractal-contracts';
import { useEffect, useMemo, useState } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { MultiSend, MultiSend__factory } from '../../assets/typechain-types/usul';
import { useNetworkConfg } from '../../providers/NetworkConfig/NetworkConfigProvider';

export default function useSafeContracts() {
  const [multiSendContract, setMultisendContract] = useState<MultiSend>();
  const [gnosisSafeFactoryContract, setGnosisSafeFactoryContract] =
    useState<GnosisSafeProxyFactory>();
  const [gnosisSafeSingletonContract, setGnosisSafeSingletonContract] = useState<GnosisSafe>();
  const [zodiacModuleProxyFactoryContract, setZodiacModuleProxyFactoryContract] =
    useState<ModuleProxyFactory>();
  const [fractalUsulMasterCopyContract, setFractalUsulMasterCopyContract] = useState<FractalUsul>();
  const [linearVotingMasterCopyContract, setLinearVotingMasterCopyContract] =
    useState<OZLinearVoting>(); // 1:1 Token Voting contract
  const [fractalModuleMasterCopyContract, setFractalModuleMasterCopyContract] =
    useState<FractalModule>();
  const [fractalRegistryContract, setFractalRegistryContract] = useState<FractalRegistry>();
  const [gnosisVetoGuardMasterCopyContract, setGnosisVetoGuardMasterCopyContract] =
    useState<VetoGuard>();
  const [usulVetoGuardMasterCopyContract, setUsulVetoGuardMasterCopyContract] =
    useState<UsulVetoGuard>();
  const [vetoMultisigVotingMasterCopyContract, setVetoMultisigVotingMasterCopyContract] =
    useState<VetoMultisigVoting>();
  const [vetoERC20VotingMasterCopyContract, setVetoERC20VotingMasterCopyContract] =
    useState<VetoERC20Voting>();
  const [votesTokenMasterCopyContract, setVotesTokenMasterCopyContract] = useState<VotesToken>();

  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);

  const {
    contracts: {
      gnosisSafe,
      gnosisSafeFactory,
      zodiacModuleProxyFactory,
      linearVotingMasterCopy,
      gnosisMultisend,
      fractalUsulMasterCopy,
      fractalModuleMasterCopy,
      fractalRegistry,
      gnosisVetoGuardMasterCopy,
      usulVetoGuardMasterCopy,
      vetoMultisigVotingMasterCopy,
      vetoERC20VotingMasterCopy,
      votesTokenMasterCopy,
    },
  } = useNetworkConfg();

  useEffect(() => {
    if (!signerOrProvider) {
      setGnosisSafeFactoryContract(undefined);
      setZodiacModuleProxyFactoryContract(undefined);
      setFractalUsulMasterCopyContract(undefined);
      setLinearVotingMasterCopyContract(undefined);
      setGnosisSafeSingletonContract(undefined);
      setFractalModuleMasterCopyContract(undefined);
      setFractalRegistryContract(undefined);
      setGnosisVetoGuardMasterCopyContract(undefined);
      setUsulVetoGuardMasterCopyContract(undefined);
      setVetoMultisigVotingMasterCopyContract(undefined);
      setVetoERC20VotingMasterCopyContract(undefined);
      setVotesTokenMasterCopyContract(undefined);
      return;
    }

    setMultisendContract(MultiSend__factory.connect(gnosisMultisend, signerOrProvider));
    setGnosisSafeFactoryContract(
      GnosisSafeProxyFactory__factory.connect(gnosisSafeFactory, signerOrProvider)
    );

    setFractalUsulMasterCopyContract(
      FractalUsul__factory.connect(fractalUsulMasterCopy, signerOrProvider)
    );
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

    setFractalRegistryContract(FractalRegistry__factory.connect(fractalRegistry, signerOrProvider));
    setGnosisVetoGuardMasterCopyContract(
      VetoGuard__factory.connect(gnosisVetoGuardMasterCopy, signerOrProvider)
    );
    setUsulVetoGuardMasterCopyContract(
      UsulVetoGuard__factory.connect(usulVetoGuardMasterCopy, signerOrProvider)
    );
    setVetoMultisigVotingMasterCopyContract(
      VetoMultisigVoting__factory.connect(vetoMultisigVotingMasterCopy, signerOrProvider)
    );
    setVetoERC20VotingMasterCopyContract(
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
    fractalUsulMasterCopy,
    signerOrProvider,
    gnosisMultisend,
    fractalModuleMasterCopy,
    fractalRegistry,
    gnosisVetoGuardMasterCopy,
    usulVetoGuardMasterCopy,
    vetoMultisigVotingMasterCopy,
    vetoERC20VotingMasterCopy,
    votesTokenMasterCopy,
  ]);

  return {
    gnosisSafeFactoryContract,
    gnosisSafeSingletonContract,
    zodiacModuleProxyFactoryContract,
    fractalUsulMasterCopyContract,
    linearVotingMasterCopyContract,
    multiSendContract,
    fractalModuleMasterCopyContract,
    fractalRegistryContract,
    gnosisVetoGuardMasterCopyContract,
    usulVetoGuardMasterCopyContract,
    vetoMultisigVotingMasterCopyContract,
    vetoERC20VotingMasterCopyContract,
    votesTokenMasterCopyContract,
  };
}
