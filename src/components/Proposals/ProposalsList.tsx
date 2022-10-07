import { useTranslation } from 'react-i18next';
import { useGovenorModule } from '../../providers/govenor/hooks/useGovenorModule';
import ProposalCard from './ProposalCard';

function ProposalsList() {
  const { proposals } = useGovenorModule();
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
        <ProposalCard
          key={proposal.number}
          proposal={proposal}
        />
      ))}
    </div>
  );
}

export default ProposalsList;
