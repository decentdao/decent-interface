import { Text, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { TxProposal, TxProposalState } from '../../../providers/Fractal/types';
import ContentBox from '../../ui/ContentBox';

export function Execute({ proposal }: { proposal: TxProposal }) {
  const { t } = useTranslation(['proposal', 'common']);

  // @todo - check permissions for user to queue
  const disabled = proposal.state !== TxProposalState.Executing;

  return (
    <ContentBox bg="black.900-semi-transparent">
      <Text textStyle="text-lg-mono-medium">{t('executeTitle')}</Text>
      <Button
        // @todo - call queue tx
        width="full"
        disabled={disabled}
        marginTop={5}
      >
        {t('execute', { ns: 'common' })}
      </Button>
    </ContentBox>
  );
}
