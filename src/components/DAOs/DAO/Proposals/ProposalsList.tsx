import EtherscanLink from "../../../ui/EtherscanLink";
import { useDAOData } from "../../../../daoData";
import H1 from "../../../ui/H1";
import ProposalCard from "./ProposalCard";

function ProposalsList({ address }: { address: string }) {
  const [{ proposals }] = useDAOData();

  return (
    <div>
      <H1>
        <EtherscanLink address={address}>
          <span className="break-all">{address}</span>
        </EtherscanLink>{" "}
        Proposal List
        <div className="grid grid-cols-3 gap-4">
        {proposals?.map((proposal) => (
          <ProposalCard key={proposal.number} proposal={proposal} />
        ))}
        </div>
      </H1>
    </div>
  );
}

export default ProposalsList;
