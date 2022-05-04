import { ProposalData } from "../../../../daoData/useProposals";
import ContentBox from "../../../ui/ContentBox";
import StatusInfo from "../../../ui/StatusInfo";

function ProposalCardDetailed({ proposal }: { proposal: ProposalData }) {
  return (
    <div className = "m-2">
      <ContentBox>
        <StatusInfo
          proposal={proposal}
          includeHR
          includeProposalId
          includeClipboard
        />
      </ContentBox>
    </div>
  );
}

export default ProposalCardDetailed;
