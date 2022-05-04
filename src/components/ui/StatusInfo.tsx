import { ProposalData } from "../../daoData/useProposals";
import StatusBox from "./StatusBox";
import Clock from "./svg/Clock";

function StatusInfo({ proposal }: { proposal: ProposalData }) {
  return (
    <div className="flex flex-row align-middle mx-4 my-2">
      <StatusBox status={proposal.stateString} />
      <div className="flex self-center text-gray-25 mx-2">#{proposal.number}</div>
      <div className="flex self-center">
        <Clock />
      </div>
      <div className="flex self-center text-gray-50 mx-1">
        {proposal.startTimeString} - {proposal.endTimeString}
      </div>
    </div>
  );
}

export default StatusInfo;