'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AzoriusProposalDetails } from '../../../../../components/Proposals/AzoriusDetails';
import { MultisigProposalDetails } from '../../../../../components/Proposals/MultisigProposalDetails';
import SnapshotProposalDetails from '../../../../../components/Proposals/SnapshotProposalDetails';
import { EmptyBox } from '../../../../../components/ui/containers/EmptyBox';
import { InfoBoxLoader } from '../../../../../components/ui/loaders/InfoBoxLoader';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../../components/ui/utils/ClientOnly';
import { DAO_ROUTES } from '../../../../../constants/routes';
import useSnapshotProposal from '../../../../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import { useGetMetadata } from '../../../../../hooks/DAO/proposal/useGetMetadata';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { FractalProposal, AzoriusProposal, SnapshotProposal } from '../../../../../types';
import { useParams } from 'react-router-dom';

export default function ProposalDetailsPage() {
  const {
    node: { daoAddress },
    governance: { proposals },
    readOnly: { dao },
  } = useFractal();
  const { proposalId } = useParams();
  const [proposal, setProposal] = useState<FractalProposal | null>();
  const { isSnapshotProposal, snapshotProposal } = useSnapshotProposal(proposal);
  const metaData = useGetMetadata(proposal);
  const { t } = useTranslation(['proposal', 'navigation', 'breadcrumbs', 'dashboard']);

  const azoriusProposal = proposal as AzoriusProposal;

  useEffect(() => {
    if (!proposals || !proposals.length || !proposalId) {
      setProposal(undefined);
      return;
    }

    const foundProposal = proposals.find(p => {
      const currentSnapshotProposal = p as SnapshotProposal;
      if (!!currentSnapshotProposal.snapshotProposalId) {
        return currentSnapshotProposal.snapshotProposalId === proposalId;
      }
      return p.proposalId === proposalId;
    });
    if (!foundProposal) {
      setProposal(null);
      return;
    }
    setProposal(foundProposal);
  }, [proposals, proposalId, isSnapshotProposal]);

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
              proposalTitle: metaData.title || snapshotProposal?.title,
            }),
            path: '',
          },
        ]}
      />
      {proposal === undefined ? (
        <InfoBoxLoader />
      ) : proposal === null ? (
        <EmptyBox emptyText={t('noProposal')} />
      ) : isSnapshotProposal ? (
        <SnapshotProposalDetails proposal={proposal as SnapshotProposal} />
      ) : dao?.isAzorius ? (
        <AzoriusProposalDetails proposal={azoriusProposal} />
      ) : (
        <MultisigProposalDetails proposal={proposal} />
      )}
    </ClientOnly>
  );
}
