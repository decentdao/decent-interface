import { Button } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import useQueueProposal from '../../../hooks/DAO/proposal/useQueueProposal';
import { FractalProposal, FractalProposalState } from '../../../types';

export default function Queue({ proposal }: { proposal: FractalProposal }) {
  const { t } = useTranslation(['proposal', 'common']);
  const { queueProposal, pending } = useQueueProposal();

  const disabled = pending || proposal.state !== FractalProposalState.Queueable;

  return (
    <Button
      width="full"
      isDisabled={disabled}
      marginTop={5}
      onClick={() => queueProposal(BigNumber.from(proposal.proposalNumber))}
    >
      {t('queue', { ns: 'common' })}
    </Button>
  );
}
