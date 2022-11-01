import { useTranslation } from 'react-i18next';
import useUsulProposals from '../../providers/gnosis/hooks/useUsulProposals';
import { UsulProposalCard } from './ProposalCard';

function UsulProposalsList() {
  const { proposals } = useUsulProposals();
  const { t } = useTranslation('proposal');

  if (proposals === undefined) {
    return <div className="text-white">{t('loadingProposals')}</div>;
  }

  if (proposals.length === 0) {
    return <div className="text-white">{t('emptyProposals')}</div>;
  }

  return (
    <div className="flex flex-col -my-2">
      {[...proposals].reverse().map(proposal => (
        <UsulProposalCard
          key={proposal.proposalNumber.toNumber()}
          proposal={proposal}
        />
      ))}
    </div>
  );
}

export default UsulProposalsList;
