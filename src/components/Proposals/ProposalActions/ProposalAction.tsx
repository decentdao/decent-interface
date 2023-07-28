import { Button, Flex, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { DAO_ROUTES } from '../../../constants/routes';
import useCastVote from '../../../hooks/DAO/proposal/useCastVote';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalProposal, FractalProposalState, SnapshotProposal } from '../../../types';
import ContentBox from '../../ui/containers/ContentBox';
import { ProposalCountdown } from '../../ui/proposal/ProposalCountdown';
import { Execute } from './Execute';
import CastVote from './Vote';

export function ProposalActions({ proposal }: { proposal: FractalProposal }) {
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

export function ProposalAction({
  proposal,
  expandedView,
}: {
  proposal: FractalProposal;
  expandedView?: boolean;
}) {
  const {
    node: { daoAddress, daoSnapshotURL },
    readOnly: { user, dao },
  } = useFractal();
  const { push } = useRouter();
  const { t } = useTranslation();
  const isSnapshotProposal = !!(proposal as SnapshotProposal).snapshotProposalId;
  const { canVote } = useCastVote({ proposal });

  const showActionButton =
    user.votingWeight.gt(0) &&
    (proposal.state === FractalProposalState.ACTIVE ||
      proposal.state === FractalProposalState.EXECUTABLE ||
      proposal.state === FractalProposalState.TIMELOCKABLE ||
      proposal.state === FractalProposalState.TIMELOCKED);

  const handleClick = () => {
    if (isSnapshotProposal) {
      window.open(
        `https://snapshot.org/#/${daoSnapshotURL}/proposal/${
          (proposal as SnapshotProposal).snapshotProposalId
        }`
      );
    } else {
      push(DAO_ROUTES.proposal.relative(daoAddress, proposal.proposalId));
    }
  };

  const labelKey = useMemo(() => {
    switch (proposal.state) {
      case FractalProposalState.ACTIVE:
        return 'vote';
      case FractalProposalState.TIMELOCKABLE:
        return 'timelockTitle';
      case FractalProposalState.EXECUTABLE:
      case FractalProposalState.TIMELOCKED:
        return 'executeTitle';
      default:
        return '';
    }
  }, [proposal]);

  const label = useMemo(() => {
    if (isSnapshotProposal) {
      return t('snapshotVote');
    }

    if (proposal.state === FractalProposalState.ACTIVE) {
      if (!canVote) {
        return t('details');
      }
      return t(dao?.isAzorius ? 'vote' : 'sign');
    }
    return t('details');
  }, [isSnapshotProposal, proposal.state, t, canVote, dao]);

  if (!showActionButton) {
    if (!expandedView) {
      return (
        <Button
          variant="secondary"
          onClick={handleClick}
        >
          {t('details')}
        </Button>
      );
    }
    // This means that Proposal in state where there's no action to perform
    return null;
  }

  if (expandedView) {
    if (user.votingWeight.eq(0)) return <></>;

    return (
      <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
        <Flex justifyContent="space-between">
          <Text textStyle="text-lg-mono-medium">
            {t(labelKey, {
              ns: proposal.state === FractalProposalState.ACTIVE ? 'common' : 'proposal',
            })}
          </Text>
          <ProposalCountdown proposal={proposal} />
        </Flex>
        <ProposalActions proposal={proposal} />
      </ContentBox>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant={showActionButton && canVote ? 'primary' : 'secondary'}
    >
      {label}
    </Button>
  );
}
