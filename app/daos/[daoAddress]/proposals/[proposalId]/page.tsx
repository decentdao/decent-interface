'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AzoriusProposalDetails } from '../../../../../src/components/Proposals/AzoriusDetails';
import { MultisigProposalDetails } from '../../../../../src/components/Proposals/MultisigProposalDetails';
import { EmptyBox } from '../../../../../src/components/ui/containers/EmptyBox';
import { InfoBoxLoader } from '../../../../../src/components/ui/loaders/InfoBoxLoader';
import PageHeader from '../../../../../src/components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../../src/components/ui/utils/ClientOnly';
import { DAO_ROUTES } from '../../../../../src/constants/routes';
import { useFractal } from '../../../../../src/providers/App/AppProvider';
import { FractalProposal, AzoriusProposal } from '../../../../../src/types';

export default function ProposalDetailsPage({
  params: { proposalId },
}: {
  params: { proposalId: string };
}) {
  const {
    node: { daoAddress },
    governance: { proposals },
    readOnly: { dao },
  } = useFractal();

  const [proposal, setProposal] = useState<FractalProposal | null>();
  const { t } = useTranslation(['proposal', 'navigation', 'breadcrumbs', 'dashboard']);

  const azoriusProposal = proposal as AzoriusProposal;

  const transactionDescription = t('proposalDescription', {
    ns: 'dashboard',
    count: proposal?.targets.length,
  });

  useEffect(() => {
    if (!proposals || !proposals.length || !proposalId) {
      setProposal(undefined);
      return;
    }

    const foundProposal = proposals.find(p => {
      return p.proposalId === proposalId;
    });
    if (!foundProposal) {
      setProposal(null);
      return;
    }
    setProposal(foundProposal);
  }, [proposals, proposalId]);

  return (
    <ClientOnly>
      <PageHeader
        title={t('proposalOverview')}
        breadcrumbs={[
          {
            terminus: t('proposals', { ns: 'breadcrumbs' }),
            path: DAO_ROUTES.proposals.relative(daoAddress),
          },
          {
            terminus: t('proposal', {
              ns: 'breadcrumbs',
              proposalId,
              proposalTitle: proposal?.metaData?.title || transactionDescription,
            }),
            path: '',
          },
        ]}
      />
      {proposal === undefined ? (
        <InfoBoxLoader />
      ) : proposal === null ? (
        <EmptyBox emptyText={t('noProposal')} />
      ) : dao?.isAzorius ? (
        <AzoriusProposalDetails proposal={azoriusProposal} />
      ) : (
        <MultisigProposalDetails proposal={proposal} />
      )}
    </ClientOnly>
  );
}
