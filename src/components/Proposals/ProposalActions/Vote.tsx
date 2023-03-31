import { Text, Button, Flex, Tooltip } from '@chakra-ui/react';
import { CloseX, Check } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import useCastVote from '../../../hooks/DAO/proposal/useCastVote';
import useCurrentBlockNumber from '../../../hooks/utils/useCurrentBlockNumber';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  FractalProposal,
  UsulProposal,
  FractalProposalState,
  UsulVoteChoice,
  AzoriusGovernance,
} from '../../../types';

import ContentBox from '../../ui/containers/ContentBox';
import ProposalTime from '../../ui/proposal/ProposalTime';

function Vote({
  proposal,
  currentUserHasVoted,
}: {
  proposal: FractalProposal;
  currentUserHasVoted: boolean;
}) {
  const [pending, setPending] = useState<boolean>(false);
  const { t } = useTranslation(['common', 'proposal']);
  const { isLoaded: isCurrentBlockLoaded, currentBlockNumber } = useCurrentBlockNumber();
  const { governance } = useFractal();

  const azoriusGovernance = governance as AzoriusGovernance;
  const usulProposal = proposal as UsulProposal;

  const { address: account } = useAccount();

  const castVote = useCastVote({
    proposalNumber: BigNumber.from(proposal.proposalNumber),
    setPending: setPending,
  });

  // if the user has no delegated tokens, don't show anything
  if (
    azoriusGovernance.votesToken.votingWeight &&
    azoriusGovernance.votesToken?.votingWeight.eq(0)
  ) {
    return null;
  }

  // If user is lucky enough - he could create a proposal and proceed to vote on it
  // even before the block, in which proposal was created, was mined.
  // This gives a weird behavior when casting vote fails due to requirement under OZLinearVoting contract that current block number
  // Shouldn't be equal to proposal's start block number. Which is dictated by the need to have voting tokens delegation being "finalized" to prevent proposal hijacking.
  const proposalStartBlockNotFinalized = Boolean(
    isCurrentBlockLoaded && currentBlockNumber && usulProposal.startBlock.gte(currentBlockNumber)
  );

  const disabled =
    pending ||
    proposal.state !== FractalProposalState.Active ||
    !!usulProposal.votes.find(vote => vote.voter === account) ||
    proposalStartBlockNotFinalized;

  return (
    <Tooltip
      placement="top"
      title={
        proposalStartBlockNotFinalized
          ? t('proposalStartBlockNotFinalized', { ns: 'proposal' })
          : currentUserHasVoted
          ? t('currentUserAlreadyVoted', { ns: 'proposal' })
          : undefined
      }
    >
      <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
        <Flex justifyContent="space-between">
          <Text textStyle="text-lg-mono-medium">{t('vote')}</Text>
          <ProposalTime proposal={proposal} />
        </Flex>
        <Button
          width="full"
          isDisabled={disabled}
          onClick={() => castVote(UsulVoteChoice.Yes)}
          marginTop={5}
        >
          {t('approve')}
          <Check fill="black" />
        </Button>
        <Button
          marginTop={5}
          width="full"
          isDisabled={disabled}
          onClick={() => castVote(UsulVoteChoice.No)}
        >
          {t('reject')}
          <CloseX />
        </Button>
        <Button
          marginTop={5}
          width="full"
          isDisabled={disabled}
          onClick={() => castVote(UsulVoteChoice.Abstain)}
        >
          {t('abstain')}
        </Button>
      </ContentBox>
    </Tooltip>
  );
}

export default Vote;
