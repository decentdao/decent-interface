import { ProposalData } from "../../../../daoData/useProposals";
import { useState, useEffect } from "react";
import Button from "../../../ui/Button";
import SelectVoteButton from "../../../ui/SelectVoteButton";
import useCastVote from "../../../../daoData/useCastVote";

function CastVote({ proposal }: { proposal: ProposalData }) {
  // Vote Enum
  // Against => 0
  // For => 1
  // Abstain => 2
  const [newVote, setNewVote] = useState<number>();
  const [voteButtonString, setVoteButtonString] = useState<string>();

  useEffect(() => {
    if (proposal.state !== 1) {
      setVoteButtonString("Voting Closed");
    } else if (proposal.userVote !== undefined) {
      setVoteButtonString("Already Voted");
    } else if (
      proposal.userVotePower === undefined ||
      proposal.userVotePower.eq(0)
    ) {
      setVoteButtonString("No Vote Power");
    } else {
      setVoteButtonString("Cast Vote");
    }
  }, [proposal]);

  const castVote = useCastVote({
    proposalId: proposal.id,
    vote: newVote,
  });

  return (
    <>
      <div className="flex flex-col bg-gray-600 m-2 p-2 max-w-xs py-2 rounded-md">
        <div className="flex mx-2 my-2 text-gray-25">Cast Vote</div>
        <hr className="mx-2 my-2 border-gray-200" />
        <SelectVoteButton
          onClick={() => setNewVote(1)}
          selected={newVote === 1 || proposal.userVote === 1}
          disabled={
            proposal.state !== 1 ||
            proposal.userVote !== undefined ||
            proposal.userVotePower === undefined ||
            proposal.userVotePower.eq(0)
          }
        >
          Vote Yes
        </SelectVoteButton>
        <hr className="mx-2 my-2 border-gray-200" />
        <SelectVoteButton
          onClick={() => setNewVote(0)}
          selected={newVote === 0 || proposal.userVote === 0}
          disabled={
            proposal.state !== 1 ||
            proposal.userVote !== undefined ||
            proposal.userVotePower === undefined ||
            proposal.userVotePower.eq(0)
          }
        >
          Vote No
        </SelectVoteButton>
        <hr className="mx-2 my-2 border-gray-200" />
        <SelectVoteButton
          onClick={() => setNewVote(2)}
          selected={newVote === 2 || proposal.userVote === 2}
          disabled={
            proposal.state !== 1 ||
            proposal.userVote !== undefined ||
            proposal.userVotePower === undefined ||
            proposal.userVotePower.eq(0)
          }
        >
          Abstain
        </SelectVoteButton>
        <hr className="mx-2 my-2 border-gray-200" />
        <Button
          onClick={() => castVote()}
          disabled={
            newVote === undefined ||
            proposal.state !== 1 ||
            proposal.userVote !== undefined ||
            proposal.userVotePower === undefined ||
            proposal.userVotePower.eq(0)
          }
          addedClassNames="text-gold-500 border-gold-500 mx-2 py-2"
        >
          {voteButtonString}
        </Button>
      </div>
    </>
  );
}

export default CastVote;
