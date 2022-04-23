import { ProposalData } from "../../../../daoData/useProposals";
import { useDAOData } from "../../../../daoData";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProposalCard from "./ProposalCard";
import ProposalVotes from "./ProposalVotes";

function ProposalDetails() {
  const params = useParams();
  const [{ proposals }] = useDAOData();
  const [proposal, setProposal] = useState<ProposalData>();

  useEffect(() => {
    if (proposals === undefined || params.proposalNumber === undefined) return;

    setProposal(proposals[parseInt(params.proposalNumber, 10)]);
  }, [proposals, params.proposalNumber]);

  useEffect(() => {
    console.log(proposal);
  }, [proposal]);

  if (!params.proposalNumber) {
    return <div>if you see this, it's a bug</div>;
  }

  if (proposal === undefined) {
    return <div>Proposal not found</div>;
  }

  return (
    <div className="flex">
      <ProposalCard proposal={proposal} showId={true} />
      <ProposalVotes proposal={proposal} />
    </div>
  );
}

export default ProposalDetails;
