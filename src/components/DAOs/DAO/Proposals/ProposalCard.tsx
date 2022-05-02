import { ProposalData } from "../../../../daoData/useProposals";
import useDisplayName from "../../../../hooks/useDisplayName";
import { Link } from "react-router-dom";
import ContentBox from "../../../ui/ContentBox";
import Clock from "../../../ui/svg/Clock";
import StatusBox from '../../../ui/StatusBox';

function ProposalCard({
  proposal
}: {
  proposal: ProposalData
}) {
  const proposerDisplayName = useDisplayName(proposal.proposer);
  return (
    <Link to={`proposals/${proposal.number}`}>
      <div>
        <ContentBox isLightBackground>
          <div className="flex flex-row">
            <StatusBox status={proposal.stateString} />
            <div className="px-4 py-1 text-gray-25 text-sm">#{proposal.number}</div>
            <Clock />
            <div className="px-2 py-1 text-gray-50 text-sm">
              {proposal.startTimeString} - {proposal.endTimeString}
            </div>
          </div>
          <div className="py-4 text-white text-lg font-mono">{proposal.description}</div>
          <div className="text-gray-50 text-sm">Created By<span className="text-gold-500 text-sm ml-2">{proposerDisplayName}</span></div>
        </ContentBox>
      </div>
    </Link>
  );
}

export default ProposalCard;
