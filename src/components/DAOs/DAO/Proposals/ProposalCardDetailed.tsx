import { ProposalData } from "../../../../daoData/useProposals";
import StatusInfo from "../../../ui/StatusInfo";

function ProposalCardDetailed({ proposal }: { proposal: ProposalData }) {
  return (
    <div className="flex flex-col bg-gray-600 m-2 py-2 rounded-md">
      <StatusInfo 
      proposal= {proposal}
      includeHR={true}
      includeProposalId={true}
      includeClipboard={true}
      />
    </div>
  );
}

export default ProposalCardDetailed;
