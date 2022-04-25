import { ProposalData } from "../../../../daoData/useProposals";
import useDisplayName from "../../../../hooks/useDisplayName";
import CopyToClipboard from "../../../ui/CopyToClipboard";
import Clock from "../../../ui/svg/Clock";

function ProposalCardDetailed({ proposal }: { proposal: ProposalData }) {
  const proposerDisplayName = useDisplayName(proposal.proposer);

  return (
    <div className="flex flex-col bg-gray-600 m-2 max-w-lg py-2 rounded-md">
      <div className="flex flex-row m-2 align-middle">
        <div className="flex self-center mx-1 bg-gold-500 p-2 rounded-lg">
          {proposal.stateString}
        </div>
        <div className="flex self-center text-gray-25 mx-2">
          #{proposal.number}
        </div>
        <div className="flex self-center">
          <Clock />
        </div>
        <div className="flex self-center text-gray-50 mx-1">
          {proposal.startTimeString} - {proposal.endTimeString}
        </div>
      </div>
      <div className="text-gray-25 mx-4">{proposal.description}</div>
      <hr className="mx-4 my-4 border-gray-200" />
      <div className="flex flex-row mx-4">
        <div className="text-gray-50">Created By:</div>
        <div className="text-gold-500 ml-1">{proposerDisplayName}</div>
        <CopyToClipboard textToCopy={proposal.proposer} />
      </div>
      <div className="flex flex-row mx-4 text-gray-50">
        Proposal ID:{" "}
        {`${proposal.id.toString().substring(0, 4)}...${proposal.id
          .toString()
          .slice(-4)}`}
        <CopyToClipboard textToCopy={proposal.id.toString()} />
      </div>
    </div>
  );
}

export default ProposalCardDetailed;
