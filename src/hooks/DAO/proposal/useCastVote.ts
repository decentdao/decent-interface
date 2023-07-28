import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  AzoriusGovernance,
  GovernanceSelectionType,
  FractalProposal,
  AzoriusProposal,
  MultisigProposal,
  SnapshotProposal,
} from '../../../types';
import { useTransaction } from '../../utils/useTransaction';
import useAddressERC721VotingTokens from './useAddressERC721VotingTokens';

const useCastVote = ({
  proposal,
  setPending,
}: {
  proposal: FractalProposal;
  setPending?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [canVote, setCanVote] = useState(false);
  const {
    node: { safe },
    governanceContracts: { ozLinearVotingContract, erc721LinearVotingContract },
    governance,
    readOnly: { user, dao },
  } = useFractal();

  const azoriusGovernance = useMemo(() => governance as AzoriusGovernance, [governance]);
  const isSnapshotProposal = !!(proposal as SnapshotProposal).snapshotProposalId;
  const { type } = azoriusGovernance;

  const [contractCallCastVote, contractCallPending] = useTransaction();

  const { remainingTokenIds, remainingTokenAddresses } = useAddressERC721VotingTokens(
    proposal.proposalId,
    user.address
  );

  const hasVoted = useMemo(() => {
    if (dao?.isAzorius) {
      const azoriusProposal = proposal as AzoriusProposal;
      return !!azoriusProposal?.votes.find(vote => vote.voter === user.address);
    } else if (isSnapshotProposal) {
      // Snapshot proposals not tracking votes
      return false;
    } else {
      const safeProposal = proposal as MultisigProposal;
      return !!safeProposal.confirmations.find(confirmation => confirmation.owner === user.address);
    }
  }, [dao, isSnapshotProposal, proposal, user.address]);

  useEffect(() => {
    const getCanVote = async () => {
      let newCanVote = false;
      if (user.address) {
        if (type === GovernanceSelectionType.AZORIUS_ERC20) {
          newCanVote = user.votingWeight.gt(0) && !hasVoted;
        } else if (type === GovernanceSelectionType.AZORIUS_ERC721) {
          newCanVote = user.votingWeight.gt(0) && remainingTokenIds.length > 0;
        } else if (type === GovernanceSelectionType.MULTISIG) {
          newCanVote = !!safe?.owners.includes(user.address);
        } else {
          newCanVote = false;
        }
      }

      if (canVote !== newCanVote) {
        setCanVote(newCanVote);
      }
    };

    getCanVote();
  }, [user, type, hasVoted, safe, canVote, remainingTokenIds]);
  useEffect(() => {
    if (setPending) {
      setPending(contractCallPending);
    }
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castVote = useCallback(
    async (vote: number) => {
      let contractFn;
      if (type === GovernanceSelectionType.AZORIUS_ERC20 && ozLinearVotingContract) {
        contractFn = () => ozLinearVotingContract.asSigner.vote(proposal.proposalId, vote);
      } else if (type === GovernanceSelectionType.AZORIUS_ERC721 && erc721LinearVotingContract) {
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
    ]
  );
  return { castVote, canVote, hasVoted };
};

export default useCastVote;
