import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { BigNumber } from "ethers";

function ProposalCard({
  number,
  yesVotes,
  noVotes,
  abstainVotes,
}: {
  number: number;
  yesVotes: BigNumber;
  noVotes: BigNumber;
  abstainVotes: BigNumber;
}) {
  return (
    <div className="flex flex-col">
      <div>New Proposal #{number}</div>
      <div>Yes Votes: {yesVotes.toString()}</div>
      <div>No Votes: {noVotes.toString()}</div>
      <div>Abstain Votes: {abstainVotes.toString()}</div>
    </div>
  );
}

export default ProposalCard;
