import { useEffect } from "react";

import EtherscanLink from "../../../ui/EtherscanLink";
import { useDAOData } from "../../../../daoData";
import H1 from "../../../ui/H1";
import ProposalCard from "./ProposalCard";

function ProposalsList({ address }: { address: string }) {
  const [{ proposals }] = useDAOData();

  useEffect(() => {
    console.log("PROPOSALS: ", proposals);
  }, [proposals]);

  return (
    <div>
      <H1>
        <EtherscanLink address={address}>
          <span className="break-all">{address}</span>
        </EtherscanLink>{" "}
        Proposal List
        {proposals?.map((proposal) => (
          <ProposalCard
            key={proposal.number}
            number={proposal.number}
            yesVotes={proposal.yesVotes}
            noVotes={proposal.noVotes}
            abstainVotes={proposal.abstainVotes}
          />
        ))}
      </H1>
    </div>
  );
}

export default ProposalsList;
