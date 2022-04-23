import { ProposalData } from "../../../../daoData/useProposals";
import { useDAOData } from "../../../../daoData";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import H1 from "../../../ui/H1";
import ProposalCard from "./ProposalCard";

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
    <div>
      <H1>Proposal #{params.proposalNumber}</H1>
      <ProposalCard proposal={proposal} showId={true} />
    </div>
  );
}

export default ProposalDetails;
