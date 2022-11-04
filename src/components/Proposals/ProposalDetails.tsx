import { useEffect, useState } from 'react';
// import ProposalVotes from './ProposalVotes';
// import ProposalQueue from './ProposalQueue';
// import ProposalExecute from './ProposalExecute';
// import CastVote from './CastVote';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useProposals from '../../providers/fractal/hooks/useProposals';
import { Proposal } from '../../providers/fractal/types';
import ProposalCardDetailed from './ProposalCardDetailed';

function ProposalDetails() {
  const params = useParams();

  const { proposals } = useProposals();
  const [proposal, setProposal] = useState<Proposal>();
  const { t } = useTranslation('proposal');

  useEffect(() => {
    if (proposals === undefined || params.proposalNumber === undefined) {
      setProposal(undefined);
      return;
    }

    const proposalNumber = parseInt(params.proposalNumber);
    const foundProposal = proposals.find(p => p.proposalNumber.toNumber() === proposalNumber);
    if (foundProposal === undefined) {
      setProposal(undefined);
      return;
    }
    setProposal(foundProposal);
  }, [proposals, params.proposalNumber]);

  if (proposal === undefined) {
    return <div className="text-white">{t('loadingProposals')}</div>;
  }

  // @todo - implement queueing, voting and execution
  return (
    <div>
      {/* <ProposalQueue proposal={proposal} /> */}
      {/* <ProposalExecute proposal={proposal} /> */}
      <ProposalCardDetailed proposal={proposal} />
      <div className="flex">
        {/* <CastVote proposal={proposal} />
        <ProposalVotes proposal={proposal} /> */}
      </div>
    </div>
  );
}

export default ProposalDetails;
