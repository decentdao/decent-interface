
import { useState } from "react";
import { ProposalData } from "../../../../daoData/useProposals";
import useQueueTransaction from "../../../../daoData/useQueueTransaction";
import Button from "../../../ui/Button";

function ProposalQueue({proposal}:{proposal:ProposalData}) {
  const [pending, setPending] = useState<boolean>(false);
  const queueTransaction = useQueueTransaction({
    proposalData: proposal,
    setPending: setPending
  });
  return (
    <div className="flex flex-col bg-gray-600 m-2 p-2 max-w-xs py-2 rounded-md">
      <div className="flex mx-2 my-1 text-gray-25">Queue Transaction</div>
      <hr className="mx-2 my-1 border-gray-200" />
      <div className="flex flex-row mx-2 my-1">
        <Button
        onClick={queueTransaction}
        addedClassNames = "px-8 py-2 mx-2 border-gold-300 bg-chocolate-500 text-gold-300"
        >
          Queue Transaction
        </Button>
      </div>
    </div>
  );
}

export default ProposalQueue;