import { useState } from 'react';
import { ProposalData, ProposalState } from '../../contexts/daoData/useProposals';
import useQueueTransaction from '../../hooks/useQueueTransaction';
import { PrimaryButton } from '../ui/forms/Button';

function ProposalQueue({ proposal }: { proposal: ProposalData }) {
  const [pending, setPending] = useState<boolean>(false);

  const queueTransaction = useQueueTransaction({
    proposalData: proposal,
    setPending,
  });

  if (proposal.state !== ProposalState.Succeeded) {
    return null;
  }

  return (
    <div className="flex border-1 items-center m-2 bg-gray-600 py-2 rounded-md">
      <div className="align-middle text-gray-25 mx-4">
        Proposal has succeeded and ready to queue
      </div>
      <div className="flex flex-grow justify-end mx-4">
        <PrimaryButton
          label="Queue Proposal"
          onClick={queueTransaction}
          disabled={pending}
        />
      </div>
    </div>
  );
}

export default ProposalQueue;
