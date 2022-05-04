import { ProposalData } from "../../../../daoData/useProposals";
import ContentBox from "../../../ui/ContentBox";
import ProposalCreatedBy from "../../../ui/ProposalCreatedBy";
import ProposalDescription from "../../../ui/ProposalDescription";
import ProposalId from "../../../ui/ProposalId";
import ProposalNumber from "../../../ui/ProposalNumber";
import ProposalTime from "../../../ui/ProposalTime";
import StatusBox from "../../../ui/StatusBox";

function ProposalCardDetailed({ proposal }: { proposal: ProposalData }) {
  if (!proposal || !proposal.startTimeString || !proposal.endTimeString || !proposal.idSubstring) return (<div></div>)
  return (
    <div className="mx-2">
      <ContentBox >
        <div className="flex items-center">
          <StatusBox status={proposal.stateString} />
          <ProposalNumber
            proposalNumber={proposal.number}
          />
          <ProposalTime
            proposalStartString={proposal.startTimeString}
            proposalEndString={proposal.endTimeString}
          />
        </div>
        <ProposalDescription proposalDesc={proposal.description} />
        <div className="pt-4 border-t border-gray-200">
          <ProposalCreatedBy
            proposalProposer={proposal.proposer}
            addedClasses={"justify-between items-center"}
            includeClipboard
          />
          <ProposalId
            proposalId={proposal.idSubstring}
            addedClasses={"justify-between items-center"}
            includeClipboard
          />
        </div>
      </ContentBox>
    </div>
  );
}

export default ProposalCardDetailed;
