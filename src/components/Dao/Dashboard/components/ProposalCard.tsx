import { Link } from 'react-router-dom';
import { ProposalData, ProposalState } from '../../../../providers/govenor/types';
import { PrimaryButton, SecondaryButton } from '../../../ui/forms/Button';
import ContentBox from '../../../ui/ContentBox';
import StatusBox from '../../../ui/StatusBox';
import { formatDatesDiffReadable } from '../../../../helpers/dateTime';

type ProposalCardProps = {
  proposal: ProposalData;
  daoAddress?: string;
  moduleAddress?: string;
};

// @todo - cleanup components in src/components/ui/proposal
function ProposalCard({ proposal, daoAddress, moduleAddress }: ProposalCardProps) {
  const isProposalActive =
    proposal.state !== ProposalState.Defeated &&
    proposal.state !== ProposalState.Canceled &&
    proposal.state !== ProposalState.Executed &&
    proposal.state !== ProposalState.Expired;
  const now = new Date();

  return (
    <ContentBox>
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap flex-1">
          <div className="flex items-center">
            <StatusBox status={proposal.state} />
            {proposal.startTime && (
              <span className="text-base text-gray-50 ml-4">
                {formatDatesDiffReadable(proposal.startTime, now)} ago
              </span>
            )}
          </div>
          <p className="mt-4 text-white text-lg font-mono w-full">{proposal.description}</p>
        </div>
        {isProposalActive && proposal.endTime && proposal.endTime.getTime() > now.getTime() && (
          <span className="text-base text-gray-50 mx-14">
            {formatDatesDiffReadable(proposal.endTime, now)} left
          </span>
        )}
        <Link to={`/daos/${daoAddress}/modules/${moduleAddress}/proposals/${proposal.number}`}>
          {isProposalActive ? (
            <PrimaryButton
              label={
                proposal.state === ProposalState.Pending
                  ? 'Vote'
                  : proposal.state === ProposalState.Queued && proposal.eta !== 0
                  ? 'Execute'
                  : 'View'
              }
            />
          ) : (
            <SecondaryButton label="View" />
          )}
        </Link>
      </div>
    </ContentBox>
  );
}

export default ProposalCard;
