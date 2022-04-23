import { ProposalData } from "../../../../daoData/useProposals";

function ProposalVotes({ proposal }: { proposal: ProposalData }) {
  return (
    <div className="flex flex-col bg-gray-600 m-2 max-w-xs py-2 rounded-md">
      <div className="flex mx-2 my-1 text-gray-25">Results</div>
      <hr className="mx-2 my-1 border-gray-200" />
      <div className="flex flex-row mx-2 my-1">
        <div className="flex flex-grow mr-4 text-gray-50">Yes</div>
        <div className="flex ml-2 text-gray-25">
          {proposal.forVotesPercent}%
        </div>
      </div>
      <hr className="mx-2 my-1 border-gray-200" />
      <div className="flex flex-row mx-2 my-1">
        <div className="flex flex-grow mr-4 text-gray-50">No</div>
        <div className="flex ml-2 text-gray-25">
          {proposal.againstVotesPercent}%
        </div>
      </div>
      <hr className="mx-2 my-1 border-gray-200" />
      <div className="flex flex-row mx-2 my-1">
        <div className="flex flex-grow mr-4 text-gray-50">Abstain</div>
        <div className="flex ml-4 text-gray-25">
          {proposal.abstainVotesPercent}%
        </div>
      </div>
    </div>
  );
}

export default ProposalVotes;
