import { ProposalData } from "../../daoData/useProposals";
import useDisplayName from "../../hooks/useDisplayName";
import CopyToClipboard from "./CopyToClipboard";
import StatusBox from "./StatusBox";
import Clock from "./svg/Clock";

function StatusInfo({ proposal, includeHR, includeProposalId, includeClipboard }: { proposal: ProposalData, includeHR?: boolean, includeProposalId?: boolean, includeClipboard?: boolean }) {
  const proposerDisplayName = useDisplayName(proposal.proposer);

  return (
    <div>
      <div className="flex flex-row align-middle">
        <StatusBox status={proposal.stateString} />
        <div className="flex self-center text-gray-25 mx-2">#{proposal.number}</div>
        <div className="flex self-center">
          <Clock />
        </div>
        <div className="flex self-center text-gray-50 mx-1">
          {proposal.startTimeString} - {proposal.endTimeString}
        </div>
      </div>
      <div className="py-4 text-white text-lg font-mono">{proposal.description}</div>
      {includeHR && <hr />}
      <div className="flex max-w-xs my-1">
          <div className="text-gray-50">Created By:</div>
          <div className="text-gold-500 ml-1">{proposerDisplayName}</div>
          {includeClipboard && <CopyToClipboard textToCopy={proposal.proposer} />}
        </div>
        {includeProposalId && <div className="flex text-gray-50 max-w-xs">
          <div>Proposal ID:</div>
          <div className="ml-1">{proposal.idSubstring}</div>
          {includeClipboard && <CopyToClipboard textToCopy={proposal.id.toString()} />}
        </div>}
    </div>
  );
}

export default StatusInfo;