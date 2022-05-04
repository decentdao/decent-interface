import { ProposalData } from "../../../../daoData/useProposals";
import { Link } from "react-router-dom";
import ContentBox from "../../../ui/ContentBox";
import StatusBox from "../../../ui/StatusBox";
import ProposalNumber from "../../../ui/ProposalNumber";
import ProposalTime from "../../../ui/ProposalTime";
import ProposalDescription from "../../../ui/ProposalDescription";
import ProposalCreatedBy from "../../../ui/ProposalCreatedBy";

function ProposalCard({ proposal }: { proposal: ProposalData }) {
  if (!proposal || !proposal.startTimeString || !proposal.endTimeString) return (<div></div>)
  return (
    <Link to={`proposals/${proposal.number}`}>
      <ContentBox isLightBackground>
        <div className="flex items-center">
          <StatusBox status={proposal.stateString} />
          <ProposalNumber
            proposalNumber={proposal.number}
            textSize="text-sm"
          />
          <ProposalTime
            proposalStartString={proposal.startTimeString}
            proposalEndString={proposal.endTimeString}
            textSize="text-sm"
          />
        </div>
        <ProposalDescription proposalDesc={proposal.description} />
        <ProposalCreatedBy
          proposalProposer={proposal.proposer}
          textSize="text-sm"
        />
      </ContentBox>
    </Link>
  );
}

export default ProposalCard;
