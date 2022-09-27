import { Link } from 'react-router-dom';
import { ProposalData, ProposalState } from '../../../../providers/govenor/types';
import { PrimaryButton, SecondaryButton } from '../../../ui/forms/Button';
import ContentBox from '../../../ui/ContentBox';
import StatusBox from '../../../ui/StatusBox';
import dateTimeFormatter from '../../../../helpers/dateTimeFormatter';

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
        <div className="w-[80%]">
          <div className="flex">
            <StatusBox status={proposal.state} />
            {proposal.startTime && (
              <span className="text-base text-gray-50">
                {dateTimeFormatter(proposal.startTime, now)} ago
              </span>
            )}
          </div>
          <p className="mt-4 text-white text-lg font-mono">{proposal.description}</p>
        </div>
        {proposal.endTime && now.getTime() > proposal.endTime.getTime() && (
          <span className="text-base text-gray-50">
            {dateTimeFormatter(proposal.endTime, now)} left
          </span>
        )}
        <Link to={`/#/daos/${daoAddress}/modules/${moduleAddress}/proposals/${proposal.number}`}>
          {isProposalActive ? (
            <PrimaryButton label={proposal.state === ProposalState.Pending ? 'Vote' : 'Execute'} />
          ) : (
            <SecondaryButton label="View" />
          )}
        </Link>
      </div>
    </ContentBox>
  );
}

export default ProposalCard;
