import {
  FractalModule__factory,
  FractalRegistry__factory,
  AzoriusFreezeGuard__factory,
  ERC20FreezeVoting__factory,
  MultisigFreezeGuard__factory,
  MultisigFreezeVoting__factory,
  VotesERC20__factory,
  GnosisSafeProxyFactory__factory,
  ModuleProxyFactory__factory,
  LinearERC20Voting__factory,
  Azorius__factory,
  ERC20Claim__factory,
  VotesERC20Wrapper__factory,
  KeyValuePairs__factory,
  LinearERC721Voting__factory,
  ERC721FreezeVoting__factory,
} from '@fractal-framework/fractal-contracts';
import { useMemo } from 'react';
import { MultiSend__factory } from '../../assets/typechain-types/usul';
import { GnosisSafeL2__factory } from '../../assets/typechain-types/usul/factories/@gnosis.pm/safe-contracts/contracts';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import useSignerOrProvider from '../utils/useSignerOrProvider';

export default function useSafeContracts() {
  const signerOrProvider = useSignerOrProvider();
  const provider = useEthersProvider();

  const {
    contracts: {
      safe,
      safeFactory,
      zodiacModuleProxyFactory,
      linearVotingMasterCopy,
      multisend,
      fractalAzoriusMasterCopy,
      fractalModuleMasterCopy,
      fractalRegistry,
      multisigFreezeGuardMasterCopy,
      azoriusFreezeGuardMasterCopy,
      multisigFreezeVotingMasterCopy,
      erc20FreezeVotingMasterCopy,
      erc721FreezeVotingMasterCopy,
      votesERC20MasterCopy,
      claimingMasterCopy,
      votesERC20WrapperMasterCopy,
      linearVotingERC721MasterCopy,
      keyValuePairs,
    },
  } = useNetworkConfig();

  const daoContracts = useMemo(() => {
    if (!signerOrProvider || !provider) {
      return;
    }
    const multiSendContract = {
      asSigner: MultiSend__factory.connect(multisend, signerOrProvider),
      asProvider: MultiSend__factory.connect(multisend, provider),
    };

    const safeFactoryContract = {
      asSigner: GnosisSafeProxyFactory__factory.connect(safeFactory, signerOrProvider),
      asProvider: GnosisSafeProxyFactory__factory.connect(safeFactory, provider),
    };

    const fractalAzoriusMasterCopyContract = {
      asSigner: Azorius__factory.connect(fractalAzoriusMasterCopy, signerOrProvider),
      asProvider: Azorius__factory.connect(fractalAzoriusMasterCopy, provider),
    };

    const linearVotingMasterCopyContract = {
      asSigner: LinearERC20Voting__factory.connect(linearVotingMasterCopy, signerOrProvider),
      asProvider: LinearERC20Voting__factory.connect(linearVotingMasterCopy, provider),
    };
    const linearVotingERC721MasterCopyContract = {
      asSigner: LinearERC721Voting__factory.connect(linearVotingERC721MasterCopy, signerOrProvider),
      asProvider: LinearERC721Voting__factory.connect(linearVotingERC721MasterCopy, provider),
    };

    const safeSingletonContract = {
      asSigner: GnosisSafeL2__factory.connect(safe, signerOrProvider),
      asProvider: GnosisSafeL2__factory.connect(safe, provider),
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

    const freezeMultisigVotingMasterCopyContract = {
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

    const freezeERC721VotingMasterCopyContract = {
      asSigner: ERC721FreezeVoting__factory.connect(erc721FreezeVotingMasterCopy, signerOrProvider),
      asProvider: ERC721FreezeVoting__factory.connect(erc721FreezeVotingMasterCopy, provider),
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

    const keyValuePairsContract = {
      asSigner: KeyValuePairs__factory.connect(keyValuePairs, signerOrProvider),
      asProvider: KeyValuePairs__factory.connect(keyValuePairs, provider),
    };

    return {
      multiSendContract,
      safeFactoryContract,
      fractalAzoriusMasterCopyContract,
      linearVotingMasterCopyContract,
      safeSingletonContract,
      zodiacModuleProxyFactoryContract,
      fractalModuleMasterCopyContract,
      fractalRegistryContract,
      multisigFreezeGuardMasterCopyContract,
      azoriusFreezeGuardMasterCopyContract,
      freezeMultisigVotingMasterCopyContract,
      freezeERC20VotingMasterCopyContract,
      freezeERC721VotingMasterCopyContract,
      votesTokenMasterCopyContract,
      claimingMasterCopyContract,
      votesERC20WrapperMasterCopyContract,
      linearVotingERC721MasterCopyContract,
      keyValuePairsContract,
    };
  }, [
    safeFactory,
    safe,
    zodiacModuleProxyFactory,
    linearVotingMasterCopy,
    fractalAzoriusMasterCopy,
    multisend,
    fractalModuleMasterCopy,
    fractalRegistry,
    multisigFreezeGuardMasterCopy,
    azoriusFreezeGuardMasterCopy,
    multisigFreezeVotingMasterCopy,
    erc20FreezeVotingMasterCopy,
    votesERC20MasterCopy,
    claimingMasterCopy,
    votesERC20WrapperMasterCopy,
    linearVotingERC721MasterCopy,
    erc721FreezeVotingMasterCopy,
    keyValuePairs,
    signerOrProvider,
    provider,
  ]);

  return daoContracts;
}
