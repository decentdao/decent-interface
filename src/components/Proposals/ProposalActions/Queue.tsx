import { Text, Button, Flex } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import useQueueProposal from '../../../hooks/DAO/proposal/useQueueProposal';
import { FractalProposal, FractalProposalState } from '../../../types';
import ContentBox from '../../ui/containers/ContentBox';
import ProposalTime from '../../ui/proposal/ProposalTime';

export default function Queue({ proposal }: { proposal: FractalProposal }) {
  const { t } = useTranslation(['proposal', 'common']);
  const { queueProposal, pending } = useQueueProposal();

  const disabled = pending || proposal.state !== FractalProposalState.Queueable;

  return (
    <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
      <Flex justifyContent="space-between">
        <Text textStyle="text-lg-mono-medium">{t('queueTitle')}</Text>
        <ProposalTime proposal={proposal} />
      </Flex>
      <Button
        width="full"
        isDisabled={disabled}
        marginTop={5}
        onClick={() => queueProposal(BigNumber.from(proposal.proposalNumber))}
      >
        {t('queue', { ns: 'common' })}
      </Button>
    </ContentBox>
  );
}
