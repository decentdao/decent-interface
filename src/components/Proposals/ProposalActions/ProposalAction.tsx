import { Button, Flex, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  FractalProposal,
  UsulProposal,
  FractalProposalState,
  MultisigProposal,
} from '../../../types';
import ContentBox from '../../ui/containers/ContentBox';
import ProposalTime from '../../ui/proposal/ProposalTime';
import { Execute } from './Execute';
import Queue from './Queue';
import CastVote from './Vote';

export function ProposalActions({
  proposal,
  hasVoted,
}: {
  proposal: FractalProposal;
  hasVoted: boolean;
}) {
  console.log('🚀 ~ file: ProposalActionWrapper.tsx:18 ~ hasVoted:', hasVoted);
  switch (proposal.state) {
    case FractalProposalState.Active:
      return (
        <CastVote
          proposal={proposal}
          currentUserHasVoted={hasVoted}
        />
      );
    case FractalProposalState.Queueable:
      return <Queue proposal={proposal} />;
    case FractalProposalState.Executing:
    case FractalProposalState.TimeLocked:
    case FractalProposalState.Queued:
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
    node: { daoAddress },
  } = useFractal();
  const { address: account } = useAccount();
  const { push } = useRouter();
  const { t } = useTranslation();
  const isUsulProposal = !!(proposal as UsulProposal).govTokenAddress;

  const showActionButton =
    proposal.state === FractalProposalState.Active ||
    proposal.state === FractalProposalState.Executing ||
    proposal.state === FractalProposalState.Queueable ||
    proposal.state === FractalProposalState.TimeLocked ||
    proposal.state === FractalProposalState.Queued;

  const handleClick = () => {
    push(DAO_ROUTES.proposal.relative(daoAddress, proposal.proposalNumber));
  };

  const hasVoted = useMemo(() => {
    if (isUsulProposal) {
      const usulProposal = proposal as UsulProposal;
      return !!usulProposal.votes.find(vote => vote.voter === account);
    } else {
      const safeProposal = proposal as MultisigProposal;
      return !!safeProposal.confirmations.find(confirmation => confirmation.owner === account);
    }
  }, [account, isUsulProposal, proposal]);

  const labelKey = useMemo(() => {
    switch (proposal.state) {
      case FractalProposalState.Active:
        return 'vote';
      case FractalProposalState.Queueable:
        return 'queueTitle';
      case FractalProposalState.Executing:
      case FractalProposalState.TimeLocked:
      case FractalProposalState.Queued:
        return 'executeTitle';
      default:
        return '';
    }
  }, [proposal]);

  const label = useMemo(() => {
    if (proposal.state === FractalProposalState.Active) {
      if (hasVoted) {
        return t('details');
      }
      return t(isUsulProposal ? 'vote' : 'sign');
    }
    return t('details');
  }, [proposal, t, isUsulProposal, hasVoted]);

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
    return (
      <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
        <Flex justifyContent="space-between">
          <Text textStyle="text-lg-mono-medium">
            {t(labelKey, {
              ns: proposal.state === FractalProposalState.Active ? 'common' : 'proposal',
            })}
          </Text>
          <ProposalTime proposal={proposal} />
        </Flex>
        <ProposalActions
          proposal={proposal}
          hasVoted={hasVoted}
        />
      </ContentBox>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant={showActionButton && !hasVoted ? 'primary' : 'secondary'}
    >
      {label}
    </Button>
  );
}
