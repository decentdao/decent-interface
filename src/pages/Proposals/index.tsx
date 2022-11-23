import { Box } from '@chakra-ui/react';
import { Button } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ProposalsList from '../../components/Proposals/ProposalsList';
import PageHeader from '../../components/ui/Header/PageHeader';
import { ModalType } from '../../modals/ModalProvider';
import { useFractalModal } from '../../modals/useFractalModal';
import { useFractal } from '../../providers/fractal/hooks/useFractal';

export function Governance() {
  const { t } = useTranslation(['common', 'proposal']);
  const {
    gnosis: { daoName },
  } = useFractal();

  return (
    <Box mt="3rem">
      <PageHeader
        title={t('pageTitle', { daoName, ns: 'proposal' })}
        titleTestId={'title-proposals'}
        buttonVariant="text"
        buttonText={t('delegate')}
        buttonClick={useFractalModal(ModalType.DELEGATE)}
        buttonTestId="link-delegate"
      >
        <Link to="new">
          <Button
            size="base"
            marginLeft={4}
          >
            {t('createProposal', { ns: 'proposal' })}
          </Button>
        </Link>
      </PageHeader>
      <ProposalsList />
    </Box>
  );
}
