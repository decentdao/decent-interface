import { Text, Button } from '@chakra-ui/react';
import { CloseX } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCastVote from '../../../providers/Fractal/hooks/useCastVote';
import { TxProposal, TxProposalState, UsulVoteChoice } from '../../../providers/Fractal/types';
import ContentBox from '../../ui/ContentBox';
import Check from '../../ui/svg/Check';

function Vote({ proposal }: { proposal: TxProposal }) {
  const [pending, setPending] = useState<boolean>(false);
  const { t } = useTranslation();

  const castVote = useCastVote({
    proposalNumber: BigNumber.from(proposal.proposalNumber),
    setPending: setPending,
  });

  const disabled = pending || proposal.state !== TxProposalState.Active; // @todo - check permissions for user to vote

  return (
    <ContentBox bg="black.900-semi-transparent">
      <Text textStyle="text-lg-mono-medium">{t('vote')}</Text>
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
