import { ProposalData } from "../../../../daoData/useProposals";
import { Link } from "react-router-dom";

function ProposalCard({ proposal }: { proposal: ProposalData }) {

  return (
    <div className="flex flex-col bg-gray-300 m-2 max-w-lg">
      <div>Proposal #{proposal.number}</div>
      <div>For: {proposal.forVotesPercent}%</div>
      <div>Against: {proposal.againstVotesPercent}%</div>
      <div>Abstain: {proposal.abstainVotesPercent}%</div>
      <div className="m-4">
        <Link to={`proposals/${proposal.number}`} className="underline">
          View Proposal
        </Link>
      </div>
    </div>
  );
}

export default ProposalCard;
