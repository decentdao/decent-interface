import { ProposalData } from "../../../../daoData/useProposals";
import { useState } from "react";
import Button from "../../../ui/Button";
import useCastVote from "../../../../daoData/useCastVote";
import ConnectModal from "../../../ConnectModal";
import Pending from "../../../Pending";

function CastVote({ proposal }: { proposal: ProposalData }) {
  // Vote Enum
  // Against => 0
  // For => 1
  // Abstain => 2
  const [vote, setVote] = useState<number>();
  const [pending, setPending] = useState<boolean>(false);

  const castVote = useCastVote({
    proposalId: proposal.id,
    vote: vote,
    setPending,
  });

  return (
    <>
      <Pending message="Creating Proposal..." pending={pending} />
      <ConnectModal />
      <div className="flex flex-col bg-gray-600 m-2 p-2 max-w-xs py-2 rounded-md">
        <div className="flex mx-2 my-1 text-gray-25">Cast Vote</div>
        <hr className="mx-2 my-1 border-gray-200" />
        <Button onClick={() => setVote(1)}>Vote Yes</Button>

        <hr className="mx-2 my-1 border-gray-200" />

        <Button onClick={() => setVote(0)}>Vote No</Button>

        <hr className="mx-2 my-1 border-gray-200" />

        <Button onClick={() => setVote(2)}>Abstain</Button>

        <hr className="mx-2 my-1 border-gray-200" />

        <Button onClick={() => castVote()}>Cast Vote</Button>
      </div>
    </>
  );
}

export default CastVote;
