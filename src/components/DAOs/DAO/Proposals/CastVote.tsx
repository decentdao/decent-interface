import { ProposalData } from "../../../../daoData/useProposals";
import { useState } from "react";
import Button from "../../../ui/Button";
import SelectVoteButton from "../../../ui/SelectVoteButton";
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
        <div className="flex mx-2 my-2 text-gray-25">Cast Vote</div>
        <hr className="mx-2 my-2 border-gray-200" />
        <SelectVoteButton
          onClick={() => setVote(1)}
          selected={vote === 1}
          disabled={proposal.stateString !== "Open"}
        >
          Vote Yes
        </SelectVoteButton>
        <hr className="mx-2 my-2 border-gray-200" />
        <SelectVoteButton
          onClick={() => setVote(0)}
          selected={vote === 0}
          disabled={proposal.stateString !== "Open"}
        >
          Vote No
        </SelectVoteButton>
        <hr className="mx-2 my-2 border-gray-200" />
        <SelectVoteButton
          onClick={() => setVote(2)}
          selected={vote === 2}
          disabled={proposal.stateString !== "Open"}
        >
          Abstain
        </SelectVoteButton>
        <hr className="mx-2 my-2 border-gray-200" />
        <Button
          onClick={() => castVote()}
          disabled={vote === undefined || proposal.stateString !== "Open"}
        >
          Cast Vote
        </Button>
        {proposal.stateString !== "Open" ? (
          <div className="text-gray-50 m-2">Proposal is closed</div>
        ) : null}
      </div>
    </>
  );
}

export default CastVote;
