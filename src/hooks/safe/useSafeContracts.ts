import {
  FractalModule__factory,
  AzoriusFreezeGuard__factory,
  ERC20FreezeVoting__factory,
  MultisigFreezeGuard__factory,
  MultisigFreezeVoting__factory,
  Azorius__factory,
  ERC721FreezeVoting__factory,
} from '@fractal-framework/fractal-contracts';
import { useMemo } from 'react';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import useSignerOrProvider from '../utils/useSignerOrProvider';

export default function useSafeContracts() {
  const signerOrProvider = useSignerOrProvider();
  const provider = useEthersProvider();

  const {
    contracts: {
      fractalAzoriusMasterCopy,
      fractalModuleMasterCopy,
      multisigFreezeGuardMasterCopy,
      azoriusFreezeGuardMasterCopy,
      multisigFreezeVotingMasterCopy,
      erc20FreezeVotingMasterCopy,
      erc721FreezeVotingMasterCopy,
    },
  } = useNetworkConfig();

  const daoContracts = useMemo(() => {
    if (!signerOrProvider || !provider) {
      return;
    }

    const fractalAzoriusMasterCopyContract = {
      asSigner: Azorius__factory.connect(fractalAzoriusMasterCopy, signerOrProvider),
      asProvider: Azorius__factory.connect(fractalAzoriusMasterCopy, provider),
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

    return {
      fractalAzoriusMasterCopyContract,
      fractalModuleMasterCopyContract,
      multisigFreezeGuardMasterCopyContract,
      azoriusFreezeGuardMasterCopyContract,
      freezeMultisigVotingMasterCopyContract,
      freezeERC20VotingMasterCopyContract,
      freezeERC721VotingMasterCopyContract,
    };
  }, [
    fractalAzoriusMasterCopy,
    fractalModuleMasterCopy,
    multisigFreezeGuardMasterCopy,
    azoriusFreezeGuardMasterCopy,
    multisigFreezeVotingMasterCopy,
    erc20FreezeVotingMasterCopy,
    erc721FreezeVotingMasterCopy,
    signerOrProvider,
    provider,
  ]);

  return daoContracts;
}
