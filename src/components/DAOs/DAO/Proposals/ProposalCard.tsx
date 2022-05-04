import { ProposalData } from "../../../../daoData/useProposals";
import { Link } from "react-router-dom";
import ContentBox from "../../../ui/ContentBox";
import StatusInfo from "../../../ui/StatusInfo";

function ProposalCard({ proposal }: { proposal: ProposalData }) {
  return (
    <Link to={`proposals/${proposal.number}`}>
      <div>
        <ContentBox isLightBackground>
          <StatusInfo
            proposal={proposal}
          />
        </ContentBox>
      </div>
    </Link>
  );
}

export default ProposalCard;
