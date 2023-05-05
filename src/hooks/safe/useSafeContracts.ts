import {
  FractalModule__factory,
  FractalRegistry__factory,
  AzoriusFreezeGuard__factory,
  ERC20FreezeVoting__factory,
  MultisigFreezeGuard__factory,
  MultisigFreezeVoting__factory,
  VotesERC20__factory,
  GnosisSafeProxyFactory__factory,
  GnosisSafe__factory,
  ModuleProxyFactory__factory,
  LinearERC20Voting__factory,
  Azorius__factory,
  ERC20Claim__factory,
  VotesERC20Wrapper__factory,
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
      fractalAzoriusMasterCopy,
      fractalModuleMasterCopy,
      fractalRegistry,
      multisigFreezeGuardMasterCopy,
      azoriusFreezeGuardMasterCopy,
      multisigFreezeVotingMasterCopy,
      erc20FreezeVotingMasterCopy,
      votesERC20MasterCopy,
      claimingMasterCopy,
      votesERC20WrapperMasterCopy,
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

    const fractalAzoriusMasterCopyContract = {
      asSigner: Azorius__factory.connect(fractalAzoriusMasterCopy, signerOrProvider),
      asProvider: Azorius__factory.connect(fractalAzoriusMasterCopy, provider),
    };

    const linearVotingMasterCopyContract = {
      asSigner: LinearERC20Voting__factory.connect(linearVotingMasterCopy, signerOrProvider),
      asProvider: LinearERC20Voting__factory.connect(linearVotingMasterCopy, provider),
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

    const multisigFreezeGuardMasterCopyContract = {
      asSigner: MultisigFreezeGuard__factory.connect(
        multisigFreezeGuardMasterCopy,
        signerOrProvider
      ),
      asProvider: MultisigFreezeGuard__factory.connect(multisigFreezeGuardMasterCopy, provider),
    };

    const azoriusFreezeGuardMasterCopyContract = {
      asSigner: AzoriusFreezeGuard__factory.connect(azoriusFreezeGuardMasterCopy, signerOrProvider),
      asProvider: AzoriusFreezeGuard__factory.connect(azoriusFreezeGuardMasterCopy, provider),
    };

    const multisigFreezeVotingMasterCopyContract = {
      asSigner: MultisigFreezeVoting__factory.connect(
        multisigFreezeVotingMasterCopy,
        signerOrProvider
      ),
      asProvider: MultisigFreezeVoting__factory.connect(multisigFreezeVotingMasterCopy, provider),
    };

    const freezeERC20VotingMasterCopyContract = {
      asSigner: ERC20FreezeVoting__factory.connect(erc20FreezeVotingMasterCopy, signerOrProvider),
      asProvider: ERC20FreezeVoting__factory.connect(erc20FreezeVotingMasterCopy, provider),
    };

    const votesTokenMasterCopyContract = {
      asSigner: VotesERC20__factory.connect(votesERC20MasterCopy, signerOrProvider),
      asProvider: VotesERC20__factory.connect(votesERC20MasterCopy, provider),
    };

    const claimingMasterCopyContract = {
      asSigner: ERC20Claim__factory.connect(claimingMasterCopy, signerOrProvider),
      asProvider: ERC20Claim__factory.connect(claimingMasterCopy, provider),
    };

    const votesERC20WrapperMasterCopyContract = {
      asSigner: VotesERC20Wrapper__factory.connect(votesERC20WrapperMasterCopy, signerOrProvider),
      asProvider: VotesERC20Wrapper__factory.connect(votesERC20WrapperMasterCopy, provider),
    };

    return {
      multiSendContract,
      gnosisSafeFactoryContract,
      fractalAzoriusMasterCopyContract,
      linearVotingMasterCopyContract,
      gnosisSafeSingletonContract,
      zodiacModuleProxyFactoryContract,
      fractalModuleMasterCopyContract,
      fractalRegistryContract,
      multisigFreezeGuardMasterCopyContract: multisigFreezeGuardMasterCopyContract,
      azoriusFreezeGuardMasterCopyContract: azoriusFreezeGuardMasterCopyContract,
      multisigFreezeVotingMasterCopyContract: multisigFreezeVotingMasterCopyContract,
      freezeERC20VotingMasterCopyContract: freezeERC20VotingMasterCopyContract,
      votesTokenMasterCopyContract,
      claimingMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
    };
  }, [
    gnosisSafeFactory,
    gnosisSafe,
    zodiacModuleProxyFactory,
    linearVotingMasterCopy,
    fractalAzoriusMasterCopy,
    gnosisMultisend,
    fractalModuleMasterCopy,
    fractalRegistry,
    multisigFreezeGuardMasterCopy,
    azoriusFreezeGuardMasterCopy,
    multisigFreezeVotingMasterCopy,
    erc20FreezeVotingMasterCopy,
    votesERC20MasterCopy,
    claimingMasterCopy,
    votesERC20WrapperMasterCopy,
    provider,
    signer,
  ]);

  return daoContracts;
}
