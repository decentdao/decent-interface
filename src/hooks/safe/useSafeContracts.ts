import {
  MultisigFreezeVoting__factory,
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
    contracts: { multisigFreezeVotingMasterCopy, erc721FreezeVotingMasterCopy },
  } = useNetworkConfig();

  const daoContracts = useMemo(() => {
    if (!signerOrProvider || !provider) {
      return;
    }

    const freezeMultisigVotingMasterCopyContract = {
      asSigner: MultisigFreezeVoting__factory.connect(
        multisigFreezeVotingMasterCopy,
        signerOrProvider,
      ),
      asProvider: MultisigFreezeVoting__factory.connect(multisigFreezeVotingMasterCopy, provider),
    };

    const freezeERC721VotingMasterCopyContract = {
      asSigner: ERC721FreezeVoting__factory.connect(erc721FreezeVotingMasterCopy, signerOrProvider),
      asProvider: ERC721FreezeVoting__factory.connect(erc721FreezeVotingMasterCopy, provider),
    };

    return {
      freezeMultisigVotingMasterCopyContract,
      freezeERC721VotingMasterCopyContract,
    };
  }, [multisigFreezeVotingMasterCopy, erc721FreezeVotingMasterCopy, signerOrProvider, provider]);

  return daoContracts;
}
