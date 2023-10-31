import snapshot from '@snapshot-labs/snapshot.js';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useSigner } from 'wagmi';
import { useVoteContext } from '../../../components/Proposals/ProposalVotes/context/VoteContext';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  AzoriusGovernance,
  GovernanceType,
  FractalProposal,
  ExtendedSnapshotProposal,
} from '../../../types';
import encryptWithShutter from '../../../utils/shutter';
import { useTransaction } from '../../utils/useTransaction';
import useUserERC721VotingTokens from './useUserERC721VotingTokens';

const hub = 'https://hub.snapshot.org';
const client = new snapshot.Client712(hub);

const useCastVote = ({
  proposal,
  setPending,
  extendedSnapshotProposal,
}: {
  proposal: FractalProposal;
  setPending?: React.Dispatch<React.SetStateAction<boolean>>;
  extendedSnapshotProposal?: ExtendedSnapshotProposal;
}) => {
  const {
    governanceContracts: { ozLinearVotingContract, erc721LinearVotingContract },
    governance,
    node: { daoSnapshotURL },
    readOnly: {
      user: { address },
    },
  } = useFractal();
  const { data: signer } = useSigner();

  const azoriusGovernance = useMemo(() => governance as AzoriusGovernance, [governance]);
  const { type } = azoriusGovernance;

  const [contractCallCastVote, contractCallPending] = useTransaction();

  const { remainingTokenIds, remainingTokenAddresses } = useUserERC721VotingTokens(
    proposal.proposalId
  );
  const { getCanVote, getHasVoted } = useVoteContext();

  useEffect(() => {
    if (setPending) {
      setPending(contractCallPending);
    }
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castVote = useCallback(
    async (vote: number) => {
      let contractFn;
      if (type === GovernanceType.AZORIUS_ERC20 && ozLinearVotingContract) {
        contractFn = () => ozLinearVotingContract.asSigner.vote(proposal.proposalId, vote);
      } else if (type === GovernanceType.AZORIUS_ERC721 && erc721LinearVotingContract) {
        contractFn = () =>
          erc721LinearVotingContract.asSigner.vote(
            proposal.proposalId,
            vote,
            remainingTokenAddresses,
            remainingTokenIds
          );
      }

      if (contractFn) {
        contractCallCastVote({
          contractFn,
          pendingMessage: t('pendingCastVote'),
          failedMessage: t('failedCastVote'),
          successMessage: t('successCastVote'),
          successCallback: () => {
            setTimeout(() => {
              getHasVoted();
              getCanVote(true);
            }, 3000);
          },
        });
      }
    },
    [
      contractCallCastVote,
      t,
      ozLinearVotingContract,
      erc721LinearVotingContract,
      type,
      proposal,
      remainingTokenAddresses,
      remainingTokenIds,
      getCanVote,
      getHasVoted,
    ]
  );

  const castSnapshotVote = useCallback(
    async (choice: number, onSuccess?: () => void) => {
      if (signer && signer?.provider && address && daoSnapshotURL && extendedSnapshotProposal) {
        let toastId;
        try {
          toastId = toast(t('pendingCastVote'), {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false,
            progress: 1,
          });
          if (extendedSnapshotProposal.privacy === 'shutter') {
            const encryptedChoice = await encryptWithShutter(
              JSON.stringify(choice),
              extendedSnapshotProposal.proposalId
            );
            await client.vote(signer.provider as ethers.providers.Web3Provider, address, {
              space: daoSnapshotURL,
              proposal: extendedSnapshotProposal.proposalId,
              type: extendedSnapshotProposal.type,
              privacy: extendedSnapshotProposal.privacy,
              choice: encryptedChoice!,
              app: 'fractal',
            });
          } else {
            await client.vote(signer.provider as ethers.providers.Web3Provider, address, {
              space: daoSnapshotURL,
              proposal: extendedSnapshotProposal.proposalId,
              type: extendedSnapshotProposal.type,
              choice,
              app: 'fractal',
            });
          }
          toast.dismiss(toastId);
          toast.success(t('successCastVote'));
          if (onSuccess) {
            onSuccess();
          }
        } catch (e) {
          toast.dismiss(toastId);
          toast.error('failedCastVote');
          console.error('Error while casting Snapshot vote', e);
        }
      }
    },
    [signer, address, daoSnapshotURL, extendedSnapshotProposal, t]
  );

  return { castVote, castSnapshotVote };
};

export default useCastVote;
