import { ProposalData } from "../../../../daoData/useProposals";
import useDisplayName from "../../../../hooks/useDisplayName";
import { Link } from "react-router-dom";
import ContentBox from "../../../ui/ContentBox";
import Clock from "../../../ui/svg/Clock";
import StatusBox from "../../../ui/StatusBox";
import StatusInfo from "../../../ui/StatusInfo";

function ProposalCard({ proposal }: { proposal: ProposalData }) {
  const proposerDisplayName = useDisplayName(proposal.proposer);
  return (
    <Link to={`proposals/${proposal.number}`}>
      <div>
        <ContentBox isLightBackground>
          <StatusInfo proposal={proposal} />
          <div className="text-gray-50 text-sm">
            Created By<span className="text-gold-500 text-sm ml-2">{proposerDisplayName}</span>
          </div>
        </ContentBox>
      </div>
    </Link>
  );
}

export default ProposalCard;
