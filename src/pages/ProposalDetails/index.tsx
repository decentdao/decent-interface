import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { MultisigProposalDetails } from '../../components/Proposals/MultisigProposalDetails';
import { UsulProposalDetails } from '../../components/Proposals/UsulDetails';
import { EmptyBox } from '../../components/ui/containers/EmptyBox';
import { InfoBoxLoader } from '../../components/ui/loaders/InfoBoxLoader';
import PageHeader from '../../components/ui/page/Header/PageHeader';

import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { TxProposal, UsulProposal } from '../../providers/Fractal/types';
import { DAO_ROUTES } from '../../routes/constants';

function ProposalDetails() {
  const params = useParams();

  const {
    gnosis: {
      safe: { address },
    },
    governance: {
      txProposalsInfo: { txProposals },
    },
  } = useFractal();

  const [proposal, setProposal] = useState<TxProposal | null>();
  const { t } = useTranslation(['proposal', 'sidebar', 'breadcrumbs', 'dashboard']);

  const usulProposal = proposal as UsulProposal;

  const transactionDescription = t('proposalDescription', {
    ns: 'dashboard',
    count: proposal?.targets.length,
  });

  useEffect(() => {
    if (!txProposals || !txProposals.length || !params.proposalNumber) {
      setProposal(undefined);
      return;
    }

    const foundProposal = txProposals.find(p => {
      return p.proposalNumber === params.proposalNumber;
    });
    if (!foundProposal) {
      setProposal(null);
      return;
    }
    setProposal(foundProposal);
  }, [txProposals, params.proposalNumber]);

  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          {
            title: t('proposals', { ns: 'breadcrumbs' }),
            path: DAO_ROUTES.proposals.relative(address),
          },
          {
            title: t('proposal', {
              ns: 'breadcrumbs',
              proposalNumber: params.proposalNumber,
              proposalTitle: proposal?.metaData?.title || transactionDescription,
            }),
            path: '',
          },
        ]}
      />
      {proposal === undefined ? (
        <Box mt={7}>
          <InfoBoxLoader />
        </Box>
      ) : proposal === null ? (
        <EmptyBox
          emptyText={t('noProposal')}
          m="2rem 0 0 0"
        />
      ) : usulProposal.govTokenAddress ? (
        <UsulProposalDetails proposal={usulProposal} />
      ) : (
        <MultisigProposalDetails proposal={proposal} />
      )}
    </Box>
  );
}

export default ProposalDetails;
