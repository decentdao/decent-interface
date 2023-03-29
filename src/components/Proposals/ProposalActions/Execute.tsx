import { Text, Button, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import useExecuteProposal from '../../../hooks/DAO/proposal/useExecuteProposal';
import { TxProposal, TxProposalState } from '../../../types';
import ContentBox from '../../ui/containers/ContentBox';
import ProposalTime from '../../ui/proposal/ProposalTime';

export function Execute({ proposal }: { proposal: TxProposal }) {
  const { t } = useTranslation(['proposal', 'common']);
  const { executeProposal, pending } = useExecuteProposal();

  const disabled = proposal.state !== TxProposalState.Executing || pending;

  return (
    <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
      <Flex justifyContent="space-between">
        <Text textStyle="text-lg-mono-medium">{t('executeTitle')}</Text>
        <ProposalTime proposal={proposal} />
      </Flex>
      <Button
        onClick={() => executeProposal(proposal)}
        width="full"
        isDisabled={disabled}
        marginTop={5}
      >
        {t('execute', { ns: 'common' })}
      </Button>
    </ContentBox>
  );
}
