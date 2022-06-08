import { useState } from "react";
import { ProposalData, ProposalState } from "../../contexts/daoData/useProposals";
import useQueueTransaction from "../../hooks/useQueueTransaction";
import { ProposalAction } from "./ProposalAction";

function ProposalQueue({ proposal }: { proposal: ProposalData }) {
  const [pending, setPending] = useState<boolean>(false);

  const queueTransaction = useQueueTransaction({
    proposalData: proposal,
    setPending
  });

  if (proposal.state !== ProposalState.Succeeded) {
    return null;
  }

  return (
    <ProposalAction
      btnLabel="Queue Proposal"
      label="Proposal has succeeded and ready to queue"
      actionFunc={queueTransaction}
      pending={pending} />
  )
}

export default ProposalQueue;
