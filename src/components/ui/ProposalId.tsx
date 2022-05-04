import CopyToClipboard from "./CopyToClipboard";

function ProposalCreatedBy({ proposalId, includeClipboard, addedClasses }: { proposalId: string, includeClipboard?: boolean, addedClasses?: string }) {

  return (
    <div className={`flex text-gray-50 max-w-xs ${addedClasses}`}>
      <div>Proposal ID:</div>
      <div className="ml-1">{proposalId}</div>
      {includeClipboard && <CopyToClipboard textToCopy={proposalId} />}
    </div>
  );
}

export default ProposalCreatedBy;