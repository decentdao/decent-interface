import { useDAOData } from "../../../../daoData";
import ProposalCard from "./ProposalCard";

function ProposalsList() {
  const [{ proposals }] = useDAOData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 lg:gap-4">
      {proposals?.slice(0).reverse().map((proposal) => (
        <ProposalCard key={proposal.number} proposal={proposal} />
      ))}
    </div>
  );
}

export default ProposalsList;
