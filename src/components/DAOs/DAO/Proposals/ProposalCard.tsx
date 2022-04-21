import { ProposalData } from "../../../../daoData/useProposals";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ProposalCard({ proposal }: { proposal: ProposalData }) {
  const [forVotesPercent, setForVotesPercent] = useState<number>();
  const [againstVotesPercent, setAgainstVotesPercent] = useState<number>();
  const [abstainVotesPercent, setAbstainVotesPercent] = useState<number>();

  useEffect(() => {
    if (
      proposal.forVotes === undefined ||
      proposal.againstVotes === undefined ||
      proposal.abstainVotes === undefined
    ) {
      return;
    }

    const totalVotes = proposal.forVotes
      ?.add(proposal.againstVotes)
      .add(proposal.abstainVotes);

    if (totalVotes.eq(0)) {
      setForVotesPercent(0);
      setAgainstVotesPercent(0);
      setAbstainVotesPercent(0);
      return;
    }

    setForVotesPercent(
      proposal.forVotes
        .mul(1000000)
        .div(totalVotes)
        .toNumber() / 10000
    );
    setAgainstVotesPercent(
      proposal.forVotes
        .mul(1000000)
        .div(totalVotes)
        .toNumber() / 10000
    );
    setAbstainVotesPercent(
      proposal.abstainVotes
        .mul(1000000)
        .div(totalVotes)
        .toNumber() / 10000
    );
  }, [proposal]);

  return (
    <div className="flex flex-col bg-gray-300 m-2 max-w-lg">
      <div>Proposal #{proposal.number}</div>
      <div>For: {forVotesPercent}%</div>
      <div>Against: {againstVotesPercent}%</div>
      <div>Abstain: {abstainVotesPercent}%</div>
      <div className="m-4">
        <Link to={`proposals/${proposal.number}`} className="underline">
          View Proposal
        </Link>
      </div>
    </div>
  );
}

export default ProposalCard;
