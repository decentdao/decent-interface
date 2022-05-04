import { ProposalData } from "../../daoData/useProposals";
import CopyToClipboard from "./CopyToClipboard";

function ProposalCreatedBy({ proposal, includeClipboard }: { proposal: ProposalData, includeClipboard?: boolean }) {

  return (
    <div className="flex max-w-xs">
      <div className="flex text-gray-50 max-w-xs py-2">
        <div>Proposal ID:</div>
        <div className="ml-1">{proposal.idSubstring}</div>
        {includeClipboard && <CopyToClipboard textToCopy={proposal.id.toString()} />}
      </div>
    </div>
  );
}

export default ProposalCreatedBy;