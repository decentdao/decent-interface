import { Link } from 'react-router-dom';
import ClaimToken from '../../components/Dao/ClaimToken';
import ProposalsList from '../../components/Proposals/ProposalsList';
import { TextButton, SecondaryButton } from '../../components/ui/forms/Button';
import H1 from '../../components/ui/H1';

export function Governance() {
  return (
    <div>
      <ClaimToken />
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <H1>Proposals</H1>
        <div className="flex ml-auto mb-2 sm:mb-0 items-center sm:items-start">
          <Link to="delegate">
            <TextButton label="Delegate" />
          </Link>
          <Link to="proposals/new">
            <SecondaryButton label="Create Proposal" />
          </Link>
        </div>
      </div>
      <ProposalsList />
    </div>
  );
}
