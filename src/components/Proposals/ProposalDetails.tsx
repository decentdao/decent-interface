import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGovenorModule } from '../../providers/govenor/hooks/useGovenorModule';
import { ProposalData } from '../../providers/govenor/types';
import CastVote from './CastVote';
import ProposalCardDetailed from './ProposalCardDetailed';
import ProposalExecute from './ProposalExecute';
import ProposalQueue from './ProposalQueue';
import ProposalVotes from './ProposalVotes';

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
