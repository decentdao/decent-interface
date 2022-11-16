import { Text } from '@chakra-ui/react';
import { Button, CloseX } from '@decent-org/fractal-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCastVote from '../../providers/fractal/hooks/useCastVote';
import { Proposal, ProposalState } from '../../providers/fractal/types';
import ContentBox from '../ui/ContentBox';
import Check from '../ui/svg/Check';

function CastVote({ proposal }: { proposal: Proposal }) {
  const [pending, setPending] = useState<boolean>(false);
  const { t } = useTranslation(['proposal', 'common']);

  const castVote = useCastVote({
    proposalNumber: proposal.proposalNumber,
    setPending: setPending,
  });

  const disabled = pending || proposal.state !== ProposalState.Active; // @todo - check permissions for user to vote

  return (
    <ContentBox bg="black.900-semi-transparent">
      <Text textStyle="text-lg-mono-medium">{t('vote', { ns: 'common' })}</Text>
      <Button
        width="full"
        disabled={disabled}
        onClick={() => castVote(1)}
        marginTop={5}
      >
        {t('approve', { ns: 'common' })}
        <Check fill="black" />
      </Button>
      <Button
        marginTop={5}
        width="full"
        disabled={disabled}
        onClick={() => castVote(0)}
      >
        {t('reject', { ns: 'common' })}
        <CloseX />
      </Button>
      <Button
        marginTop={5}
        width="full"
        disabled={disabled}
        onClick={() => castVote(2)}
      >
        {t('abstain', { ns: 'common' })}
      </Button>
    </ContentBox>
  );
}

export default CastVote;
