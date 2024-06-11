import { Button } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSnapshotProposal from '../../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import { useFractal } from '../../../providers/App/AppProvider';
import { ExtendedSnapshotProposal, FractalProposal, FractalProposalState } from '../../../types';
import { useVoteContext } from '../ProposalVotes/context/VoteContext';
import CastVote from './CastVote';
import { Execute } from './Execute';

// TODO: Refactor extendedSnapshotProposal and onCastSnapshotVote to the context
function ProposalActions({
  proposal,
  extendedSnapshotProposal,
  onCastSnapshotVote,
}: {
  proposal: FractalProposal;
  extendedSnapshotProposal?: ExtendedSnapshotProposal;
  onCastSnapshotVote?: () => Promise<void>;
}) {
  switch (proposal.state) {
    case FractalProposalState.ACTIVE:
      return (
        <CastVote
          proposal={proposal}
          extendedSnapshotProposal={extendedSnapshotProposal}
          onCastSnapshotVote={onCastSnapshotVote}
        />
      );
    case FractalProposalState.EXECUTABLE:
    case FractalProposalState.TIMELOCKED:
      return <Execute proposal={proposal} />;
    default:
      return <></>;
  }
}

// @todo: rename to AzoriusProposalAction
export function ProposalAction({
  proposal,
  expandedView,
  extendedSnapshotProposal,
  onCastSnapshotVote,
}: {
  // @todo: this is actually either an AzoriusProposal or a SnapshotProposal, refactor
  proposal: FractalProposal;
  expandedView?: boolean;
  extendedSnapshotProposal?: ExtendedSnapshotProposal;
  onCastSnapshotVote?: () => Promise<void>;
}) {
  const {
    readOnly: { user, dao },
  } = useFractal();
  const { t } = useTranslation();
  const { isSnapshotProposal } = useSnapshotProposal(proposal);
  const { canVote } = useVoteContext();

  const isActiveProposal = useMemo(
    () => proposal.state === FractalProposalState.ACTIVE,
    [proposal.state],
  );

  const showActionButton =
    (isSnapshotProposal && canVote && isActiveProposal) ||
    (user.votingWeight > 0n &&
      (isActiveProposal ||
        proposal.state === FractalProposalState.EXECUTABLE ||
        proposal.state === FractalProposalState.TIMELOCKABLE ||
        proposal.state === FractalProposalState.TIMELOCKED));

  const label = useMemo(() => {
    if (isSnapshotProposal) {
      return t('details');
    }

    if (isActiveProposal) {
      if (!canVote) {
        return t('details');
      }
      return t(dao?.isAzorius ? 'vote' : 'sign');
    }
    return t('details');
  }, [isSnapshotProposal, t, canVote, dao, isActiveProposal]);

  if (!showActionButton) {
    if (!expandedView) {
      return <Button variant="secondary">{t('details')}</Button>;
    }
    // This means that Proposal in state where there's no action to perform
    return null;
  }

  if (expandedView) {
    if (!isSnapshotProposal && (user.votingWeight === 0n || (isActiveProposal && !canVote)))
      return null;

    return (
      <ProposalActions
        proposal={proposal}
        extendedSnapshotProposal={extendedSnapshotProposal}
        onCastSnapshotVote={onCastSnapshotVote}
      />
    );
  }

  return <Button variant={showActionButton && canVote ? 'primary' : 'secondary'}>{label}</Button>;
}
