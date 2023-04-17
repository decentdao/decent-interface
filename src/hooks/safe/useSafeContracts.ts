import {
  FractalModule__factory,
  FractalRegistry__factory,
  UsulVetoGuard__factory,
  VetoERC20Voting__factory,
  VetoGuard__factory,
  VetoMultisigVoting__factory,
  VotesToken__factory,
  GnosisSafeProxyFactory__factory,
  GnosisSafe__factory,
  ModuleProxyFactory__factory,
  OZLinearVoting__factory,
  FractalUsul__factory,
  TokenClaim__factory,
} from '@fractal-framework/fractal-contracts';
import { useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { MultiSend__factory } from '../../assets/typechain-types/usul';
import { useNetworkConfg } from '../../providers/NetworkConfig/NetworkConfigProvider';

export default function useSafeContracts() {
  const provider = useProvider();
  const { data: signer } = useSigner();

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
      claimingMasterCopy,
    },
  } = useNetworkConfg();

  const daoContracts = useMemo(() => {
    const signerOrProvider = signer || provider;
    const multiSendContract = {
      asSigner: MultiSend__factory.connect(gnosisMultisend, signerOrProvider),
      asProvider: MultiSend__factory.connect(gnosisMultisend, provider),
    };

    const gnosisSafeFactoryContract = {
      asSigner: GnosisSafeProxyFactory__factory.connect(gnosisSafeFactory, signerOrProvider),
      asProvider: GnosisSafeProxyFactory__factory.connect(gnosisSafeFactory, provider),
    };

    const fractalUsulMasterCopyContract = {
      asSigner: FractalUsul__factory.connect(fractalUsulMasterCopy, signerOrProvider),
      asProvider: FractalUsul__factory.connect(fractalUsulMasterCopy, provider),
    };

    const linearVotingMasterCopyContract = {
      asSigner: OZLinearVoting__factory.connect(linearVotingMasterCopy, signerOrProvider),
      asProvider: OZLinearVoting__factory.connect(linearVotingMasterCopy, provider),
    };

    const gnosisSafeSingletonContract = {
      asSigner: GnosisSafe__factory.connect(gnosisSafe, signerOrProvider),
      asProvider: GnosisSafe__factory.connect(gnosisSafe, provider),
    };

    const zodiacModuleProxyFactoryContract = {
      asSigner: ModuleProxyFactory__factory.connect(zodiacModuleProxyFactory, signerOrProvider),
      asProvider: ModuleProxyFactory__factory.connect(zodiacModuleProxyFactory, provider),
    };

    const fractalModuleMasterCopyContract = {
      asSigner: FractalModule__factory.connect(fractalModuleMasterCopy, signerOrProvider),
      asProvider: FractalModule__factory.connect(fractalModuleMasterCopy, provider),
    };

    const fractalRegistryContract = {
      asSigner: FractalRegistry__factory.connect(fractalRegistry, signerOrProvider),
      asProvider: FractalRegistry__factory.connect(fractalRegistry, provider),
    };

    const gnosisVetoGuardMasterCopyContract = {
      asSigner: VetoGuard__factory.connect(gnosisVetoGuardMasterCopy, signerOrProvider),
      asProvider: VetoGuard__factory.connect(gnosisVetoGuardMasterCopy, provider),
    };

    const usulVetoGuardMasterCopyContract = {
      asSigner: UsulVetoGuard__factory.connect(usulVetoGuardMasterCopy, signerOrProvider),
      asProvider: UsulVetoGuard__factory.connect(usulVetoGuardMasterCopy, provider),
    };

    const vetoMultisigVotingMasterCopyContract = {
      asSigner: VetoMultisigVoting__factory.connect(vetoMultisigVotingMasterCopy, signerOrProvider),
      asProvider: VetoMultisigVoting__factory.connect(vetoMultisigVotingMasterCopy, provider),
    };

    const vetoERC20VotingMasterCopyContract = {
      asSigner: VetoERC20Voting__factory.connect(vetoERC20VotingMasterCopy, signerOrProvider),
      asProvider: VetoERC20Voting__factory.connect(vetoERC20VotingMasterCopy, provider),
    };

    const votesTokenMasterCopyContract = {
      asSigner: VotesToken__factory.connect(votesTokenMasterCopy, signerOrProvider),
      asProvider: VotesToken__factory.connect(votesTokenMasterCopy, provider),
    };

    const claimingMasterCopyContract = {
      asSigner: TokenClaim__factory.connect(claimingMasterCopy, signerOrProvider),
      asProvider: TokenClaim__factory.connect(claimingMasterCopy, provider),
    };

    return {
      multiSendContract,
      gnosisSafeFactoryContract,
      fractalUsulMasterCopyContract,
      linearVotingMasterCopyContract,
      gnosisSafeSingletonContract,
      zodiacModuleProxyFactoryContract,
      fractalModuleMasterCopyContract,
      fractalRegistryContract,
      gnosisVetoGuardMasterCopyContract,
      usulVetoGuardMasterCopyContract,
      vetoMultisigVotingMasterCopyContract,
      vetoERC20VotingMasterCopyContract,
      votesTokenMasterCopyContract,
      claimingMasterCopyContract,
    };
  }, [
    gnosisSafeFactory,
    gnosisSafe,
    zodiacModuleProxyFactory,
    linearVotingMasterCopy,
    fractalUsulMasterCopy,
    gnosisMultisend,
    fractalModuleMasterCopy,
    fractalRegistry,
    gnosisVetoGuardMasterCopy,
    usulVetoGuardMasterCopy,
    vetoMultisigVotingMasterCopy,
    vetoERC20VotingMasterCopy,
    votesTokenMasterCopy,
    claimingMasterCopy,
    provider,
    signer,
  ]);

  return {
    ...daoContracts,
  };
}
