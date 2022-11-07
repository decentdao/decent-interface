import { Proposal } from '../../providers/fractal/types';
import ContentBox from '../ui/ContentBox';
import StatusBox from '../ui/StatusBox';
import ProposalCreatedBy from '../ui/proposal/ProposalCreatedBy';
import ProposalNumber from '../ui/proposal/ProposalNumber';

function ProposalCardDetailed({ proposal }: { proposal: Proposal }) {
  return (
    <div>
      <ContentBox>
        <div className="flex items-center">
          <StatusBox state={proposal.state} />
          <ProposalNumber proposalNumber={proposal.proposalNumber.toNumber()} />
        </div>
        <div className="pt-4 border-t border-gray-200">
          <ProposalCreatedBy
            proposalProposer={proposal.proposer}
            addedClasses={'justify-between items-center'}
            includeClipboard
          />
        </div>
      </ContentBox>
    </div>
  );
}

export default ProposalCardDetailed;
