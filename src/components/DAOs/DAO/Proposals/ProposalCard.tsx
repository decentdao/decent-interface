import { ProposalData } from "../../../../daoData/useProposals";
import useDisplayName from "../../../../hooks/useDisplayName";
import { Link } from "react-router-dom";
import ContentBox from "../../../ui/ContentBox";
import Clock from "../../../ui/svg/Clock";
import { ReactNode } from "react";

function TextBox({
  children,
  borderTextColor,
}: {
  children?: ReactNode
  borderTextColor?: string,
}) {
  return (
    <div className={`px-2 py-1 bg-chocolate-400 border ${borderTextColor} rounded text-sm`}>{children}</div>
  )
}

function ProposalCard({
  proposal
}: {
  proposal: ProposalData
}) {
  const proposerDisplayName = useDisplayName(proposal.proposer);
  return (
    <Link to={`proposals/${proposal.number}`}>
      <div className="my-1">
        <ContentBox isLightBackground>
          <div className="flex flex-row">
            {proposal.stateString === "Open" ?
              <TextBox borderTextColor="border-gold-500">{proposal.stateString}</TextBox> :
              <TextBox borderTextColor="border-gray-50 text-gray-50">{proposal.stateString}</TextBox>
            }
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
