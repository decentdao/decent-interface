import { ProposalData } from "../../../../daoData/useProposals";
import ContentBox from "../../../ui/ContentBox";
import DataLoadingWrapper from "../../../ui/loaders/DataLoadingWrapper";
import ProposalCreatedBy from "../../../ui/proposal/ProposalCreatedBy";
import ProposalDescription from "../../../ui/proposal/ProposalDescription";
import ProposalId from "../../../ui/proposal/ProposalId";
import ProposalNumber from "../../../ui/proposal/ProposalNumber";
import ProposalTime from "../../../ui/proposal/ProposalTime";
import StatusBox from "../../../ui/StatusBox";

function ProposalCardDetailed({ proposal }: { proposal: ProposalData }) {
  return (
    <div className="mx-2">
      <ContentBox >
        <div className="flex items-center">
          <StatusBox status={proposal.stateString} />
          <ProposalNumber
            proposalNumber={proposal.number}
          />
          <DataLoadingWrapper isLoading={!proposal.startTimeString || !proposal.endTimeString}>
          <ProposalTime
            proposalStartString={proposal.startTimeString}
            proposalEndString={proposal.endTimeString}
          />
          </DataLoadingWrapper>
        </div>
        <ProposalDescription proposalDesc={proposal.description} />
        <DataLoadingWrapper isLoading={!proposal.id || !proposal.idSubstring}>
          <div className="pt-4 border-t border-gray-200">
            <ProposalCreatedBy
              proposalProposer={proposal.proposer}
              addedClasses={"justify-between items-center"}
              includeClipboard
            />
            <ProposalId
              proposalId={proposal.id}
              proposalIdSub={proposal.idSubstring}
              addedClasses={"justify-between items-center"}
              includeClipboard
            />
          </div>
        </DataLoadingWrapper>
      </ContentBox>
    </div>
  );
}

export default ProposalCardDetailed;
