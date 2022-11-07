import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useQueueTransaction from '../../hooks/useQueueTransaction';
import { ProposalData, ProposalState } from '../../providers/govenor/types';
import { ProposalAction } from './ProposalAction';

function ProposalQueue({ proposal }: { proposal: ProposalData }) {
  const [pending, setPending] = useState<boolean>(false);

  const queueTransaction = useQueueTransaction({
    proposalData: proposal,
    setPending,
  });

  const { t } = useTranslation('proposal');

  if (proposal.state !== ProposalState.Succeeded) {
    return null;
  }

  return (
    <ProposalAction
      btnLabel={t('btnQueueProposal')}
      label={t('labelQueueProposal')}
      actionFunc={queueTransaction}
      pending={pending}
    />
  );
}

export default ProposalQueue;
