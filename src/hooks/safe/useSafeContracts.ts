import {
  FractalModule__factory,
  AzoriusFreezeGuard__factory,
  ERC20FreezeVoting__factory,
  MultisigFreezeGuard__factory,
  MultisigFreezeVoting__factory,
  LinearERC20Voting__factory,
  Azorius__factory,
  ERC20Claim__factory,
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
      linearVotingMasterCopy,
      multisend,
      fractalAzoriusMasterCopy,
      fractalModuleMasterCopy,
      multisigFreezeGuardMasterCopy,
      azoriusFreezeGuardMasterCopy,
      multisigFreezeVotingMasterCopy,
      erc20FreezeVotingMasterCopy,
      erc721FreezeVotingMasterCopy,
      claimingMasterCopy,
      linearVotingERC721MasterCopy,
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

    const fractalModuleMasterCopyContract = {
      asSigner: FractalModule__factory.connect(fractalModuleMasterCopy, signerOrProvider),
      asProvider: FractalModule__factory.connect(fractalModuleMasterCopy, provider),
    };

    const multisigFreezeGuardMasterCopyContract = {
      asSigner: MultisigFreezeGuard__factory.connect(
        multisigFreezeGuardMasterCopy,
        signerOrProvider,
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
        signerOrProvider,
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

    const claimingMasterCopyContract = {
      asSigner: ERC20Claim__factory.connect(claimingMasterCopy, signerOrProvider),
      asProvider: ERC20Claim__factory.connect(claimingMasterCopy, provider),
    };

    return {
      multiSendContract,
      fractalAzoriusMasterCopyContract,
      linearVotingMasterCopyContract,
      safeSingletonContract,
      fractalModuleMasterCopyContract,
      multisigFreezeGuardMasterCopyContract,
      azoriusFreezeGuardMasterCopyContract,
      freezeMultisigVotingMasterCopyContract,
      freezeERC20VotingMasterCopyContract,
      freezeERC721VotingMasterCopyContract,
      claimingMasterCopyContract,
      linearVotingERC721MasterCopyContract,
    };
  }, [
    safe,
    linearVotingMasterCopy,
    fractalAzoriusMasterCopy,
    multisend,
    fractalModuleMasterCopy,
    multisigFreezeGuardMasterCopy,
    azoriusFreezeGuardMasterCopy,
    multisigFreezeVotingMasterCopy,
    erc20FreezeVotingMasterCopy,
    claimingMasterCopy,
    linearVotingERC721MasterCopy,
    erc721FreezeVotingMasterCopy,
    signerOrProvider,
    provider,
  ]);

  return daoContracts;
}
