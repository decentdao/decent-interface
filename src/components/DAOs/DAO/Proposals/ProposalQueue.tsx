
import { ProposalData } from "../../../../daoData/useProposals";
import useQueueTransaction from "../../../../daoData/useQueueTransaction";
import Button from "../../../ui/Button";
import ContentBox from "../../../ui/ContentBox";

function ProposalQueue({ proposal }: { proposal: ProposalData }) {
  const queueTransaction = useQueueTransaction({
    proposalData: proposal
  });
  return (
    <div>
      {
        proposal.stateString === "Succeeded" &&
        <ContentBox>
          <div className="flex flex-col">
            <Button
              onClick={queueTransaction}
              addedClassNames="px-2 py-2 mx-2 min-w-full border-gold-300 bg-chocolate-500 text-gold-300"
            >
              Queue Proposal
            </Button>
            <div className="text-sm text-gray-25 text-center py-2">Voting has closed and the vote has passed. Anyone can now queue the contract.</div>
          </div>
        </ContentBox>
      }
    </div>
  );
}

export default ProposalQueue;