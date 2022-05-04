import { BigNumber } from "@ethersproject/bignumber";
import CopyToClipboard from "../CopyToClipboard";
import DataLoadingWrapper from "../loaders/DataLoadingWrapper";

function ProposalCreatedBy({ proposalId, proposalIdSub, includeClipboard, addedClasses = "" }: { proposalId: BigNumber | undefined, proposalIdSub: string | undefined, includeClipboard?: boolean, addedClasses?: string }) {

  return (
    <DataLoadingWrapper isLoading={!proposalId || !proposalIdSub}>
      <div className={`flex text-gray-50 max-w-xs ${addedClasses}`}>
        <div>Proposal ID:</div>
        <div className="ml-1">{proposalIdSub}</div>
        {includeClipboard && <CopyToClipboard textToCopy={proposalId?.toString()} />}
      </div>
    </DataLoadingWrapper>
  );
}

export default ProposalCreatedBy;