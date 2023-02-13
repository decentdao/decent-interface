import { Text, Button, Flex } from '@chakra-ui/react';
import { CloseX, Check } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import useCastVote from '../../../hooks/DAO/proposal/useCastVote';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import {
  TxProposal,
  TxProposalState,
  UsulProposal,
  UsulVoteChoice,
} from '../../../providers/Fractal/types';
import ContentBox from '../../ui/containers/ContentBox';
import ProposalTime from '../../ui/proposal/ProposalTime';

function Vote({ proposal }: { proposal: TxProposal }) {
  const [pending, setPending] = useState<boolean>(false);
  const { t } = useTranslation();
  const {
    governance: { governanceToken },
  } = useFractal();

  const usulProposal = proposal as UsulProposal;

  const { address: account } = useAccount();

  const castVote = useCastVote({
    proposalNumber: BigNumber.from(proposal.proposalNumber),
    setPending: setPending,
  });

  // if the user has no delegated tokens, don't show anything
  if (governanceToken?.votingWeight?.eq(0)) {
    return null;
  }

  const disabled =
    pending ||
    proposal.state !== TxProposalState.Active ||
    !!usulProposal.votes.find(vote => vote.voter === account);

  return (
    <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
      <Flex justifyContent="space-between">
        <Text textStyle="text-lg-mono-medium">{t('vote')}</Text>
        <ProposalTime proposal={proposal} />
      </Flex>
      <Button
        width="full"
        disabled={disabled}
        onClick={() => castVote(UsulVoteChoice.Yes)}
        marginTop={5}
      >
        {t('approve')}
        <Check fill="black" />
      </Button>
      <Button
        marginTop={5}
        width="full"
        disabled={disabled}
        onClick={() => castVote(UsulVoteChoice.No)}
      >
        {t('reject')}
        <CloseX />
      </Button>
      <Button
        marginTop={5}
        width="full"
        disabled={disabled}
        onClick={() => castVote(UsulVoteChoice.Abstain)}
      >
        {t('abstain')}
      </Button>
    </ContentBox>
  );
}

export default Vote;
