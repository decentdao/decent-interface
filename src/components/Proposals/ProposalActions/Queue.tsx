import { Text, Button } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import useQueueProposal from '../../../hooks/DAO/proposal/useQueueProposal';
import {
  GovernanceActivity,
  TxProposalState,
  UsulProposal,
} from '../../../providers/Fractal/types';
import ContentBox from '../../ui/ContentBox';

export default function Queue({ proposal }: { proposal: GovernanceActivity | UsulProposal }) {
  const { t } = useTranslation(['proposal', 'common']);
  const { queueProposal, pending } = useQueueProposal();

  const disabled = pending || proposal.state !== TxProposalState.Pending;

  return (
    <ContentBox bg="black.900-semi-transparent">
      <Text textStyle="text-lg-mono-medium">{t('queueTitle')}</Text>
      <Button
        width="full"
        disabled={disabled}
        marginTop={5}
        onClick={() => queueProposal(BigNumber.from(proposal.proposalNumber))}
      >
        {t('queue', { ns: 'common' })}
      </Button>
    </ContentBox>
  );
}
