import { useState, useEffect } from "react";
import { ProposalData } from "../../../../contexts/daoData/useProposals";
import useExecuteTransaction from "../../../../hooks/useExecuteTransaction";
import { PrimaryButton } from "../../../ui/forms/Button";
import { useBlockchainData } from "../../../../contexts/blockchainData";

function ProposalExecute({ proposal }: { proposal: ProposalData }) {
  const [show, setShow] = useState<boolean>(false);
  const { currentTimestamp } = useBlockchainData();

  useEffect(() => {
    if (proposal.eta === undefined || currentTimestamp === undefined) {
      setShow(false);
      return;
    }

    // Show component if the proposal is Queued, and the execution ETA has elapsed
    setShow(proposal.state === 5 && proposal.eta !== 0 && proposal.eta < currentTimestamp);
  }, [currentTimestamp, proposal]);

  const executeTransaction = useExecuteTransaction({
    proposalData: proposal,
  });

  if (!show) return null;

  return (
    <div className="flex border-1 items-center m-2 bg-gray-600 py-2 rounded-md">
      <div className="align-middle text-gray-25 mx-4">
        Proposal ready for execution
      </div>
      <div className="flex flex-grow justify-end mx-4">
        <PrimaryButton
          onClick={() => executeTransaction()}
          label="Execute"
        />
      </div>
    </div>
  );
}

export default ProposalExecute;
