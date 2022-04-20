import { ProposalData } from "../../../../daoData/useProposals";

function ProposalCard({
  proposal
}: {
  proposal: ProposalData
}) {
  return (
    <div className="flex flex-col bg-gray-300 m-2 max-w-lg">
      <div>Proposal #{proposal.number}</div>
      <div>For: {proposal.forVotes?.toString()}</div>
      <div>Against: {proposal.againstVotes?.toString()}</div>
      <div>Abstain: {proposal.abstainVotes?.toString()}</div>
    </div>
  );
}

export default ProposalCard;
