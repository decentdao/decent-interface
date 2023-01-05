import { Box, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { MultisigProposalDetails } from '../../components/Proposals/MultisigProposalDetails';
import { UsulProposalDetails } from '../../components/Proposals/UsulDetails';
import PageHeader from '../../components/ui/Header/PageHeader';
import { EmptyBox } from '../../components/ui/containers/EmptyBox';
import { InfoBoxLoader } from '../../components/ui/loaders/InfoBoxLoader';

import LeftArrow from '../../components/ui/svg/LeftArrow';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { TxProposal, UsulProposal } from '../../providers/Fractal/types';
import { DAO_ROUTES } from '../../routes/constants';

function ProposalDetails() {
  const params = useParams();

  const {
    gnosis: { daoName },
    governance: {
      txProposalsInfo: { txProposals },
    },
  } = useFractal();

  const [proposal, setProposal] = useState<TxProposal | null>();
  const { t } = useTranslation(['proposal', 'sidebar']);

  const usulProposal = proposal as UsulProposal;

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
        title={t('pageTitle', { daoName, ns: 'proposal' })}
        titleTestId={'title-proposal-details'}
      />
      <Link to={DAO_ROUTES.proposals.relative(params.address)}>
        <Button
          paddingLeft={0}
          size="lg"
          variant="text"
        >
          <LeftArrow />
          {t('proposals', { ns: 'sidebar' })}
        </Button>
      </Link>
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
