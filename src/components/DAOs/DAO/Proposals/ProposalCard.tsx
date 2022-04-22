import { ProposalData } from "../../../../daoData/useProposals";
import useDisplayName from "../../../../hooks/useDisplayName";
import { Link } from "react-router-dom";
import { useEffect } from "react";

function ProposalCard({ proposal }: { proposal: ProposalData }) {
  const proposerDisplayName = useDisplayName(proposal.proposer);

  useEffect(() => {
    console.log(proposal);
  }, [proposal]);

  return (
    <Link to={`proposals/${proposal.number}`}>
      <div className="flex flex-col bg-gray-300 mx-2 max-w-lg py-2">
        <div className="flex flex-row mx-1">
          <div className="mx-1">{proposal.stateString}</div>
          <div className="mx-1">#{proposal.number}</div>
          <div className="mx-1">{proposal.startTimeString} - {proposal.endTimeString}</div>
        </div>
        <div className="mx-2">{proposal.description}</div>
        <div className="mx-2">Created by {proposerDisplayName}</div>
      </div>
    </Link>
  );
}

export default ProposalCard;
