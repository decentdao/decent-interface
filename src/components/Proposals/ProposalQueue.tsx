import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useQueueTransaction from '../../hooks/useQueueTransaction';
import { Proposal } from '../../providers/fractal/types';
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

  // @todo - remove this component once execution is implemented directly under ProposalAction component
  return <ProposalAction proposal={proposal as unknown as Proposal} />;
}

export default ProposalQueue;
