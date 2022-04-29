import { ProposalData } from "../../../../daoData/useProposals";
import { useDAOData } from "../../../../daoData";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProposalCardDetailed from "./ProposalCardDetailed";
import ProposalVotes from "./ProposalVotes";
import ProposalQueue from "./ProposalQueue";
import ProposalExecute from "./ProposalExecute"

function ProposalDetails() {
  const params = useParams();
  const [, setDAOAddress] = useDAOData();

  useEffect(() => {
    setDAOAddress(params.address);
  }, [params.address, setDAOAddress]);

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
    return <div className="text-white">Proposals loading...</div>
  }

  return (
    <div className="flex">
      <ProposalCardDetailed proposal={proposal} />
      <ProposalVotes proposal={proposal} />
      <ProposalQueue proposal={proposal} />
      <ProposalExecute proposal={proposal} />
    </div>
  );
}

export default ProposalDetails;
