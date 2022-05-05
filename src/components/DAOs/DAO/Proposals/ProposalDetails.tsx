import { ProposalData } from "../../../../contexts/daoData/useProposals";
import { useDAOData } from "../../../../contexts/daoData";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProposalCardDetailed from "./ProposalCardDetailed";
import ProposalVotes from "./ProposalVotes";
import ProposalQueue from "./ProposalQueue";
import ProposalExecute from "./ProposalExecute";
import CastVote from "./CastVote";

function ProposalDetails() {
  const params = useParams();

  const [{ proposals }] = useDAOData();
  const [proposal, setProposal] = useState<ProposalData>();

  useEffect(() => {
    if (proposals === undefined || params.proposalNumber === undefined) {
      setProposal(undefined);
      return;
    }

    const proposalNumber = parseInt(params.proposalNumber);
    const foundProposal = proposals.find((p) => p.number === proposalNumber);
    if (foundProposal === undefined) {
      setProposal(undefined);
      return;
    }
    setProposal(foundProposal);
  }, [proposals, params.proposalNumber]);

  if (proposal === undefined) {
    return <div className="text-white">Proposals loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <ProposalQueue proposal={proposal} />
      <ProposalExecute proposal={proposal} />
      <ProposalCardDetailed proposal={proposal} />
      <div className="flex">
        <CastVote proposal={proposal} />
        <ProposalVotes proposal={proposal} />
      </div>
    </div>
  );
}

export default ProposalDetails;
