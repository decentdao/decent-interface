import { useTranslation } from 'react-i18next';
import useProposals from '../../providers/fractal/hooks/useProposals';
import ProposalCard from './ProposalCard';

export default function ProposalsList() {
  const { proposals } = useProposals();
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
          key={proposal.proposalNumber.toNumber()}
          proposal={proposal}
        />
      ))}
    </div>
  );
}
