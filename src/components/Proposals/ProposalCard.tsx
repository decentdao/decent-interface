import { Link } from 'react-router-dom';
import ContentBox from '../ui/ContentBox';
import StatusBox from '../ui/StatusBox';
import ProposalNumber from '../ui/proposal/ProposalNumber';
import ProposalTime from '../ui/proposal/ProposalTime';
import ProposalDescription from '../ui/proposal/ProposalDescription';
import ProposalCreatedBy from '../ui/proposal/ProposalCreatedBy';
import { ProposalData } from '../../providers/govenor/types';
import { Proposal } from '../../providers/gnosis/types/usul';

function ProposalCard({ proposal }: { proposal: ProposalData | Proposal }) {
  const legacyProposal = proposal as ProposalData;
  return (
    <Link to={`proposals/${legacyProposal.number}`}>
      <ContentBox isLightBackground>
        <div className="flex items-center">
          <StatusBox status={legacyProposal.state} />
          <ProposalNumber
            proposalNumber={legacyProposal.number}
            textSize="text-sm"
          />
          <ProposalTime
            proposalStartString={legacyProposal.startTimeString}
            proposalEndString={legacyProposal.endTimeString}
            textSize="text-sm"
          />
        </div>
        <ProposalDescription proposalDesc={legacyProposal.description} />
        <ProposalCreatedBy
          proposalProposer={legacyProposal.proposer}
          textSize="text-sm"
        />
      </ContentBox>
    </Link>
  );
}

export default ProposalCard;
