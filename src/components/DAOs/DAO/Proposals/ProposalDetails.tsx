import { ProposalData } from "../../../../daoData/useProposals";
import { useDAOData } from "../../../../daoData";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProposalCardDetailed from "./ProposalCardDetailed";
import ProposalVotes from "./ProposalVotes";
import CastVote from "./CastVote";
import DelegateVote from "./DelegateVote";

function ProposalDetails() {
  const params = useParams();
  const [{ proposals }] = useDAOData();
  const [proposal, setProposal] = useState<ProposalData>();

  useEffect(() => {
    if(proposals === undefined || params.proposalNumber === undefined) {
      setProposal(undefined);
      return;
    }

    const proposalNumber = parseInt(params.proposalNumber);
    const foundProposal = proposals.find(p => p.number === proposalNumber);
    if (foundProposal === undefined) {
      setProposal(undefined);
      return;
    }
    setProposal(foundProposal);
  }, [proposals, params.proposalNumber]);

  if (!params.proposalNumber) {
    return <div>if you see this, it's a bug</div>;
  }

  if (proposal === undefined) {
    return <div>Proposal not found</div>;
  }

  return (
    <div className="flex">
      <ProposalCardDetailed proposal={proposal} />
      <ProposalVotes proposal={proposal} />
      <CastVote proposal={proposal} />
      <DelegateVote />
    </div>
  );
}

export default ProposalDetails;
