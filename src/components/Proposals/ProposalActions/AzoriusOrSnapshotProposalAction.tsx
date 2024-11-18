import { Button } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSnapshotProposal from '../../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusProposal, FractalProposalState, SnapshotProposal } from '../../../types';
import { useVoteContext } from '../ProposalVotes/context/VoteContext';
import { CastVote } from './CastVote';
import { Execute } from './Execute';

function ProposalActions({ proposal }: { proposal: AzoriusProposal | SnapshotProposal }) {
  switch (proposal.state) {
    case FractalProposalState.ACTIVE:
      return <CastVote proposal={proposal} />;
    case FractalProposalState.EXECUTABLE:
    case FractalProposalState.TIMELOCKED:
      return <Execute proposal={proposal} />;
    default:
      return <></>;
  }
}

export function AzoriusOrSnapshotProposalAction({
  proposal,
  expandedView,
}: {
  proposal: AzoriusProposal | SnapshotProposal;
  expandedView?: boolean;
}) {
  const {
    governance: { isAzorius },
  } = useFractal();
  const { t } = useTranslation();
  const { snapshotProposal } = useSnapshotProposal(proposal);
  const { canVote } = useVoteContext();

  const isActiveProposal = useMemo(
    () => proposal.state === FractalProposalState.ACTIVE,
    [proposal.state],
  );

  const showActionButton =
    (snapshotProposal && canVote && isActiveProposal) ||
    isActiveProposal ||
    proposal.state === FractalProposalState.EXECUTABLE ||
    proposal.state === FractalProposalState.TIMELOCKABLE ||
    proposal.state === FractalProposalState.TIMELOCKED;

  const label = useMemo(() => {
    if (snapshotProposal) {
      return t('details');
    }

    if (isActiveProposal) {
      if (!canVote) {
        return t('details');
      }
      return t(isAzorius ? 'vote' : 'sign');
    }
    return t('details');
  }, [snapshotProposal, t, canVote, isAzorius, isActiveProposal]);

  if (!showActionButton) {
    if (!expandedView) {
      return <Button variant="secondary">{t('details')}</Button>;
    }
    // This means that Proposal in state where there's no action to perform
    return null;
  }

  if (expandedView) {
    if (!snapshotProposal && isActiveProposal && !canVote) return null;

    return <ProposalActions proposal={proposal} />;
  }

  return <Button variant={showActionButton && canVote ? 'primary' : 'secondary'}>{label}</Button>;
}
