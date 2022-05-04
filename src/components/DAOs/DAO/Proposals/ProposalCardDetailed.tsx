import { ProposalData } from "../../../../daoData/useProposals";
import ContentBox from "../../../ui/ContentBox";
import StatusInfo from "../../../ui/StatusInfo";

function ProposalCardDetailed({ proposal }: { proposal: ProposalData }) {
  return (
    <ContentBox>
      <StatusInfo
        proposal={proposal}
        includeHR={true}
        includeProposalId={true}
        includeClipboard={true}
      />
    </ContentBox>
  );
}

export default ProposalCardDetailed;
