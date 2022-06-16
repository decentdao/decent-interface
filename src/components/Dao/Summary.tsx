import { Link } from 'react-router-dom';
import ProposalsList from '../Proposals/ProposalsList';
import H1 from '../ui/H1';
import { PrimaryButton, SecondaryButton, TextButton } from '../ui/forms/Button';

function Summary() {
  return (
    <div>
      <div className="mb-8">
        <H1>New Transaction</H1>
        <Link to="transactions/new">
          <PrimaryButton label="Make Transaction" />
        </Link>
      </div>
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

export default Summary;
