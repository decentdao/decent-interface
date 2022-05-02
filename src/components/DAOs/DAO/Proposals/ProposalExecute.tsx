import { useState, useEffect } from "react";
import { ProposalData } from "../../../../daoData/useProposals";
import useExecuteTransaction from "../../../../daoData/useExecuteTransaction";
import { PrimaryButton } from "../../../ui/forms/Button";
import { useDAOData } from "../../../../daoData";

function ProposalExecute({ proposal }: { proposal: ProposalData }) {
  const [show, setShow] = useState<boolean>(false);
  const [{ currentTimestamp }] = useDAOData();

  useEffect(() => {
    if (proposal.eta === undefined || currentTimestamp === undefined) {
      setShow(false);
      return;
    }

    setShow(proposal.eta !== 0 && proposal.eta < currentTimestamp);
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
