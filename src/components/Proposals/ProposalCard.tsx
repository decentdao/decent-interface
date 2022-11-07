import { Link } from 'react-router-dom';
import { Proposal } from '../../providers/fractal/types/usul';
import ContentBox from '../ui/ContentBox';
import StatusBox from '../ui/StatusBox';
import ProposalCreatedBy from '../ui/proposal/ProposalCreatedBy';
import ProposalNumber from '../ui/proposal/ProposalNumber';

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <Link to={proposal.proposalNumber.toString()}>
      <ContentBox isLightBackground>
        <div className="flex items-center">
          <StatusBox state={proposal.state} />
          <ProposalNumber
            proposalNumber={proposal.proposalNumber.toNumber()}
            textSize="text-sm"
          />
        </div>
        <ProposalCreatedBy
          proposalProposer={proposal.proposer}
          textSize="text-sm"
        />
      </ContentBox>
    </Link>
  );
}
