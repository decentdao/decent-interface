import { ProposalData } from "../../../../daoData/useProposals";
import { Link } from "react-router-dom";

function ProposalCard({ proposal }: { proposal: ProposalData }) {

  return (
    <Link to={`proposals/${proposal.number}`} className="underline">
    <div className="flex flex-col bg-gray-300 m-2 max-w-lg">
      <div>Proposal #{proposal.number}</div>
      <div>{proposal.description}</div>
    </div>
    </Link>
  );
}

export default ProposalCard;
