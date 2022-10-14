import { ProposalData } from '../../providers/govenor/types';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProposalCardDetailed from './ProposalCardDetailed';
import ProposalVotes from './ProposalVotes';
import ProposalQueue from './ProposalQueue';
import ProposalExecute from './ProposalExecute';
import CastVote from './CastVote';
import { useGovenorModule } from '../../providers/govenor/hooks/useGovenorModule';
import { useTranslation } from 'react-i18next';

function ProposalDetails() {
  const params = useParams();

  const { proposals } = useGovenorModule();
  const [proposal, setProposal] = useState<ProposalData>();
  const { t } = useTranslation('proposal');

  useEffect(() => {
    if (proposals === undefined || params.proposalNumber === undefined) {
      setProposal(undefined);
      return;
    }

    const proposalNumber = parseInt(params.proposalNumber);
    const foundProposal = proposals.find(p => p.number === proposalNumber);
    if (foundProposal === undefined) {
      setProposal(undefined);
      return;
    }
    setProposal(foundProposal);
  }, [proposals, params.proposalNumber]);

  if (proposal === undefined) {
    return <div className="text-white">{t('loadingProposals')}</div>;
  }

  return (
    <div>
      <ProposalQueue proposal={proposal} />
      <ProposalExecute proposal={proposal} />
      <ProposalCardDetailed proposal={proposal} />
      <div className="flex">
        <CastVote proposal={proposal} />
        <ProposalVotes proposal={proposal} />
      </div>
    </div>
  );
}

export default ProposalDetails;
