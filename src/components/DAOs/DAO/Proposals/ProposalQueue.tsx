import { ProposalData } from "../../../../daoData/useProposals";
import useQueueTransaction from "../../../../daoData/useQueueTransaction";
import PrimaryButton from "../../../ui/PrimaryButton";
import ContentBox from "../../../ui/ContentBox";

function ProposalQueue({ proposal }: { proposal: ProposalData }) {
  const queueTransaction = useQueueTransaction({
    proposalData: proposal,
  });

  if (proposal.stateString !== "Succeeded") {
    return null;
  }

  return (
    <div className="flex flex-shrink m-2">
      <ContentBox title="Queue Proposal">
        <div className="flex justify-center">
          <PrimaryButton onClick={queueTransaction}>
            Queue Proposal
          </PrimaryButton>
        </div>
        <div className="text-sm text-gray-50 text-center py-2">
          Proposal has succeeded and ready to queue
        </div>
      </ContentBox>
    </div>
  );
}

export default ProposalQueue;
