import { Text } from '@chakra-ui/react';
import { Button } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { Proposal, ProposalState } from '../../../providers/fractal/types';
import ContentBox from '../../ui/ContentBox';

export default function Queue({ proposal }: { proposal: Proposal }) {
  const { t } = useTranslation(['proposal', 'common']);

  // @todo - check permissions for user to queue
  const disabled = proposal.state !== ProposalState.Pending;

  return (
    <ContentBox bg="black.900-semi-transparent">
      <Text textStyle="text-lg-mono-medium">{t('queueTitle')}</Text>
      <Button
        // @todo - call queue tx
        width="full"
        disabled={disabled}
        marginTop={5}
      >
        {t('queue', { ns: 'common' })}
      </Button>
    </ContentBox>
  );
}
