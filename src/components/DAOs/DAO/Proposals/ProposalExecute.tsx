
import { ProposalData } from "../../../../daoData/useProposals";
import useExecuteTransaction from "../../../../daoData/useExecuteTransaction";
import Button from "../../../ui/Button";
import ContentBox from "../../../ui/ContentBox";

function ProposalExecute({ proposal }: { proposal: ProposalData }) {
  const queueTransaction = useExecuteTransaction({
    proposalData: proposal
  });
  return (
    <div>
      {
        proposal.stateString === "Expired" &&
        <ContentBox>
          <div className="flex flex-col">
            <Button
              onClick={queueTransaction}
              addedClassNames="px-2 py-2 min-w-full border-gold-300 bg-chocolate-500 text-gold-300"
            >
              Execute Proposal
            </Button>
            <div className="text-sm text-gray-25 text-center py-2">Queuing has completed. Anyone can now Execute the contract.</div>
          </div>
        </ContentBox>
      }
    </div>
  );
}

export default ProposalExecute;