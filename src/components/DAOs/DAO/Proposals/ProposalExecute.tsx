import { useState, useEffect } from "react";
import { ProposalData } from "../../../../daoData/useProposals";
import useExecuteTransaction from "../../../../daoData/useExecuteTransaction";
import PrimaryButton from "../../../ui/PrimaryButton";
import useBlockTimestamp from "../../../../hooks/useBlockTimestamp";

function ProposalExecute({ proposal }: { proposal: ProposalData }) {
  const [show, setShow] = useState<boolean>(false);
  const blockTimestamp = useBlockTimestamp();

  useEffect(() => { 
    if(proposal.eta === undefined || blockTimestamp === undefined) {
      return;
    }

    if(proposal.eta !== 0 && proposal.eta < blockTimestamp) {
      setShow(true);
    }
  }, [blockTimestamp, proposal]);

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
        <PrimaryButton onClick={executeTransaction}>
          Execute Proposal
        </PrimaryButton>
      </div>
    </div>
  );
}

export default ProposalExecute;
