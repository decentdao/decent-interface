import { ProposalData } from "../../../../daoData/useProposals";
import useDisplayName from "../../../../hooks/useDisplayName";
import { useEffect } from "react";

function ProposalCardDetailed({ proposal }: { proposal: ProposalData }) {
  const proposerDisplayName = useDisplayName(proposal.proposer);

  useEffect(() => {
    console.log(proposal);
  }, [proposal]);

  return (
      <div className="flex flex-col bg-gray-300 m-2 max-w-lg py-2 rounded-md">
        <div className="flex flex-row mx-1">
          <div className="mx-1">{proposal.stateString}</div>
          <div className="mx-1">#{proposal.number}</div>
          <div className="mx-1">
            {proposal.startTimeString} - {proposal.endTimeString}
          </div>
        </div>
        <div className="mx-2">{proposal.description}</div>
        <div className="mx-2">Created By: {proposerDisplayName}</div>
        <div className="mx-2">
          Proposal ID:{" "}
          {`${proposal.id.toString().substring(0, 4)}...${proposal.id
            .toString()
            .slice(-4)}`}
        </div>
      </div>
  );
}

export default ProposalCardDetailed;
