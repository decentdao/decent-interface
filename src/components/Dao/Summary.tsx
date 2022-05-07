import { Link } from "react-router-dom";
import ProposalsList from "../DAOs/DAO/Proposals/ProposalsList";
import H1 from "../ui/H1";
import { SecondaryButton, TextButton } from '../ui/forms/Button';

function Summary() {
  return (
    <>
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
    </>
  );
}

export default Summary;
