import { useDAOData } from "../../../../daoData";
import ProposalCard from "./ProposalCard";

function ProposalsList() {
  const [{ proposals }] = useDAOData();

  if (!proposals.length) {
    return (
      <div className="text-white">Proposals loading...</div>
    )
  }

  return (
    <div className="flex flex-col">
      {[...proposals].reverse().map((proposal) => (
        <ProposalCard key={proposal.number} proposal={proposal} />
      ))}
    </div>
  );
}

export default ProposalsList;
