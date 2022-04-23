import { ProposalData } from "../../../../daoData/useProposals";

function ProposalVotes({ proposal }: { proposal: ProposalData }) {
  return (
    <div className="flex flex-col bg-gray-300 m-2 max-w-xs py-2 rounded-md">
      <div className="flex mx-2 my-1">Results</div>
      <hr className="mx-2 my-1" />
      <div className="flex flex-row mx-2 my-1">
        <div className="flex flex-grow mr-4">Yes</div>
        <div className="flex ml-2">{proposal.forVotesPercent}%</div>
      </div>
      <hr className="mx-2 my-1" />
      <div className="flex flex-row mx-2 my-1">
        <div className="flex flex-grow mr-4">No</div>
        <div className="flex ml-2">{proposal.againstVotesPercent}%</div>
      </div>
      <hr className="mx-2 my-1" />
      <div className="flex flex-row mx-2 my-1">
        <div className="flex flex-grow mr-4">Abstain</div>
        <div className="flex ml-4">{proposal.abstainVotesPercent}%</div>
      </div>
    </div>
  );
}

export default ProposalVotes;
