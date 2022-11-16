import { useTranslation } from 'react-i18next';
import { Proposal } from '../../providers/fractal/types';
import ContentBox from '../ui/ContentBox';

function VotesPercentage({ label, percentage }: { label: string; percentage?: number }) {
  return (
    <div className="flex flex-row mx-2 py-3 border-t border-gray-200">
      <div className="flex flex-grow mr-4 text-gray-50 font-medium">{label}</div>
      <div className="flex ml-2 text-gray-25 text-lg font-semibold font-mono">{percentage}%</div>
    </div>
  );
}

function ProposalVotes({ proposal }: { proposal: Proposal }) {
  const { t } = useTranslation();
  return (
    <ContentBox bg="black.900-semi-transparent">
      <div className="flex mx-2 my-2 text-gray-25 mb-3 text-lg font-semibold">Results</div>
      <VotesPercentage
        label={t('yes')}
        percentage={proposal.votes.yes.toNumber()}
      />

      <VotesPercentage
        label={t('no')}
        percentage={proposal.votes.no.toNumber()}
      />

      <VotesPercentage
        label={t('abstain')}
        percentage={proposal.votes.abstain.toNumber()}
      />
    </ContentBox>
  );
}

export default ProposalVotes;
