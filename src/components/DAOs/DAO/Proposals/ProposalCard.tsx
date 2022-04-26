import { ProposalData } from "../../../../daoData/useProposals";
import useDisplayName from "../../../../hooks/useDisplayName";
import { Link } from "react-router-dom";
import ContentBox from "../../../ui/ContentBox";
import Clock from "../../../ui/svg/Clock";

function ProposalCard({
  proposal
}: {
  proposal: ProposalData
}) {
  const proposerDisplayName = useDisplayName(proposal.proposer);

  return (
    <Link to={`proposals/${proposal.number}`}>
      <ContentBox onHover="hover:border-2 hover:border-gold-300 hover:shadow-sm hover:shadow-gold-300">
        <div className="flex flex-row">
          <div className="px-2 py-1 bg-chocolate-400 border border-gold-500 rounded text-gold-500 text-sm">{proposal.stateString}</div>
          <div className="px-4 py-1 text-gray-25 text-sm">#{proposal.number}</div>
          <div className="py-1">
            <Clock />
          </div>
          <div className="px-2 py-1 text-gray-50 text-sm">
            {proposal.startTimeString} - {proposal.endTimeString}
          </div>
        </div>
        <div className="py-4 text-white">{proposal.description}</div>
        <div className="text-gray-50 text-sm">Created By <span className="text-gold-500 text-sm">{proposerDisplayName}</span></div>
      </ContentBox>
    </Link>
  );
}

export default ProposalCard;
