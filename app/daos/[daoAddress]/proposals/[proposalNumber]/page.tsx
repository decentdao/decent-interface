'use client';

import { Box } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultisigProposalDetails } from '../../../../../src/components/Proposals/MultisigProposalDetails';
import { UsulProposalDetails } from '../../../../../src/components/Proposals/UsulDetails';
import { EmptyBox } from '../../../../../src/components/ui/containers/EmptyBox';
import { InfoBoxLoader } from '../../../../../src/components/ui/loaders/InfoBoxLoader';
import PageHeader from '../../../../../src/components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../../src/constants/routes';
import useDAOController from '../../../../../src/hooks/DAO/useDAOController';
import { useFractal } from '../../../../../src/providers/Fractal/hooks/useFractal';
import { TxProposal, UsulProposal } from '../../../../../src/types';

export default function ProposalDetailsPage() {
  useDAOController();
  const search = useSearchParams();
  const proposalNumber = search.get('proposalNumber');

  const {
    gnosis: {
      safe: { address },
    },
    governance: {
      txProposalsInfo: { txProposals },
    },
  } = useFractal();

  const [proposal, setProposal] = useState<TxProposal | null>();
  const { t } = useTranslation(['proposal', 'navigation', 'breadcrumbs', 'dashboard']);

  const usulProposal = proposal as UsulProposal;

  const transactionDescription = t('proposalDescription', {
    ns: 'dashboard',
    count: proposal?.targets.length,
  });

  useEffect(() => {
    if (!txProposals || !txProposals.length || !proposalNumber) {
      setProposal(undefined);
      return;
    }

    const foundProposal = txProposals.find(p => {
      return p.proposalNumber === proposalNumber;
    });
    if (!foundProposal) {
      setProposal(null);
      return;
    }
    setProposal(foundProposal);
  }, [txProposals, proposalNumber]);

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
              proposalNumber,
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
