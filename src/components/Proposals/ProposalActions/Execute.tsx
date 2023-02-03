import { Text, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import useExecuteProposal from '../../../hooks/DAO/proposal/useExecuteProposal';
import { TxProposal, TxProposalState } from '../../../providers/Fractal/types';
import ContentBox from '../../ui/containers/ContentBox';

export function Execute({ proposal }: { proposal: TxProposal }) {
  const { t } = useTranslation(['proposal', 'common']);
  const { executeProposal, pending } = useExecuteProposal();

  const disabled = proposal.state !== TxProposalState.Executing || pending;

  return (
    <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
      <Text textStyle="text-lg-mono-medium">{t('executeTitle')}</Text>
      <Button
        onClick={() => executeProposal(proposal)}
        width="full"
        disabled={disabled}
        marginTop={5}
      >
        {t('execute', { ns: 'common' })}
      </Button>
    </ContentBox>
  );
}
