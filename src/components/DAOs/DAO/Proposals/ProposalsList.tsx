import { useDAOData } from "../../../../daoData";
import ProposalCard from "./ProposalCard";

function ProposalsList({ address }: { address: string }) {
  const [{ proposals }] = useDAOData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {proposals?.map((proposal) => (
        <ProposalCard key={proposal.number} proposal={proposal} />
      ))}
    </div>
  );
}

export default ProposalsList;
