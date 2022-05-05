import { ProposalData } from "../../../../contexts/daoData/useProposals";
import { useState, useEffect } from "react";
import useCastVote from "../../../../hooks/useCastVote";
import { PrimaryButton, SecondaryButton } from "../../../ui/forms/Button";
import Check from "../../../ui/svg/Check";
import ContentBanner from "../../../ui/ContentBanner";

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
    } else if (proposal.userVotePower === undefined || proposal.userVotePower.eq(0)) {
      setVoteButtonString("No Vote Power");
    } else {
      setVoteButtonString("Cast Vote");
    }
  }, [proposal]);

  const castVote = useCastVote({
    proposalId: proposal.id,
    vote: newVote,
  });

  const NoSelected = () => (newVote === 0 || proposal.userVote === 0 ? <Check /> : null);
  const YesSelected = () => (newVote === 1 || proposal.userVote === 1 ? <Check /> : null);
  const AbstainedSelected = () => (newVote === 2 || proposal.userVote === 2 ? <Check /> : null);
  return (
    <>
      <div className="flex flex-col bg-gray-600 m-2 p-2 pb-4 w-3/5 rounded-md">
        <div className="flex mx-2 my-2 text-gray-25 text-lg font-semibold">Cast Vote</div>
        <hr className="mx-2 mb-6 border-gray-200" />
        <div className="flex flex-col gap-4">
          <SecondaryButton
            onClick={() => setNewVote(1)}
            icon={<YesSelected />}
            disabled={proposal.state !== 1 || proposal.userVote !== undefined || proposal.userVotePower === undefined || proposal.userVotePower.eq(0)}
            label="Vote Yes"
            isIconRight
            isSpaceBetween
            isLarge
          />
          <SecondaryButton
            onClick={() => setNewVote(0)}
            icon={<NoSelected />}
            disabled={proposal.state !== 1 || proposal.userVote !== undefined || proposal.userVotePower === undefined || proposal.userVotePower.eq(0)}
            label="Vote Not"
            isIconRight
            isSpaceBetween
            isLarge
          />
          <SecondaryButton
            onClick={() => setNewVote(2)}
            icon={<AbstainedSelected />}
            disabled={proposal.state !== 1 || proposal.userVote !== undefined || proposal.userVotePower === undefined || proposal.userVotePower.eq(0)}
            label="Abstain"
            isIconRight
            isSpaceBetween
            isLarge
          />
          <PrimaryButton
            className="mt-4"
            onClick={() => castVote()}
            disabled={
              newVote === undefined ||
              proposal.state !== 1 ||
              proposal.userVote !== undefined ||
              proposal.userVotePower === undefined ||
              proposal.userVotePower.eq(0)
            }
            label={voteButtonString}
            isLarge
          />
        </div>
        <div className="mt-6 py-2 mx-2 border-t border-gray-300">
          <ContentBanner description="You only get one vote, make it count. (Copy WIP)" />
        </div>
      </div>
    </>
  );
}

export default CastVote;
