import { useGovenorModule } from '../../providers/govenor/hooks/useGovenorModule';
import ProposalCard from './ProposalCard';

function ProposalsList() {
  const { proposals } = useGovenorModule();

  if (proposals === undefined) {
    return <div className="text-white">Proposals loading...</div>;
  }

  if (proposals.length === 0) {
    return <div className="text-white">No proposals</div>;
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
