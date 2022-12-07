import { Text, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useExecuteProposal from '../../../hooks/DAO/proposal/useExecuteProposal';
import { Proposal, ProposalState } from '../../../providers/Fractal/types';
import ContentBox from '../../ui/ContentBox';

export function Execute({ proposal }: { proposal: Proposal }) {
  const { t } = useTranslation(['proposal', 'common']);
  const { executeProposal, pending } = useExecuteProposal();

  const disabled = proposal.state !== ProposalState.Executing || pending;

  return (
    <ContentBox bg="black.900-semi-transparent">
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
