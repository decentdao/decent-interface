import { Link } from 'react-router-dom';
import ContentBox from '../ui/ContentBox';
import StatusBox, { UsulStatusBox } from '../ui/StatusBox';
import ProposalNumber from '../ui/proposal/ProposalNumber';
import ProposalTime from '../ui/proposal/ProposalTime';
import ProposalDescription from '../ui/proposal/ProposalDescription';
import ProposalCreatedBy from '../ui/proposal/ProposalCreatedBy';
import { ProposalData } from '../../providers/govenor/types';
import { Proposal } from '../../providers/gnosis/types/usul';

function ProposalCard({ proposal }: { proposal: ProposalData }) {
  return (
    <Link to={`proposals/${proposal.number}`}>
      <ContentBox isLightBackground>
        <div className="flex items-center">
          <StatusBox status={proposal.state} />
          <ProposalNumber
            proposalNumber={proposal.number}
            textSize="text-sm"
          />
          <ProposalTime
            proposalStartString={proposal.startTimeString}
            proposalEndString={proposal.endTimeString}
            textSize="text-sm"
          />
        </div>
        <ProposalDescription proposalDesc={proposal.description} />
        <ProposalCreatedBy
          proposalProposer={proposal.proposer}
          textSize="text-sm"
        />
      </ContentBox>
    </Link>
  );
}

export function UsulProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <Link to={`proposals/${proposal.proposalNumber.toNumber()}`}>
      <ContentBox isLightBackground>
        <div className="flex items-center">
          <UsulStatusBox state={proposal.state} />
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

export default ProposalCard;
