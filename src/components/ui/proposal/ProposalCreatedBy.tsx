import useDisplayName from "../../../hooks/useDisplayName";
import CopyToClipboard from "../CopyToClipboard";

function ProposalCreatedBy({ proposalProposer, includeClipboard, textSize ="", addedClasses="" }: { proposalProposer: string, includeClipboard?: boolean, textSize?: string, addedClasses?: string }) {
  const proposerDisplayName = useDisplayName(proposalProposer);

  return (
    <div className={`flex max-w-xs ${textSize} ${addedClasses}`}>
      <div className="text-gray-50">Created By:</div>
      <div className="text-gold-500 ml-2">{proposerDisplayName}</div>
      {includeClipboard && <CopyToClipboard textToCopy={proposalProposer} />}
    </div>
  );
}

export default ProposalCreatedBy;