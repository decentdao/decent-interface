import { Box, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Proposals from '../../components/Proposals';
import PageHeader from '../../components/ui/Header/PageHeader';
import { ModalType } from '../../components/ui/modals/ModalProvider';
import { useFractalModal } from '../../components/ui/modals/useFractalModal';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../providers/Fractal/types';

export function Governance() {
  const { t } = useTranslation(['common', 'proposal']);
  const {
    gnosis: { daoName },
    governance: { type, governanceToken },
  } = useFractal();

  const delegate = useFractalModal(ModalType.DELEGATE);
  const showDelegate =
    type === GovernanceTypes.GNOSIS_SAFE_USUL && governanceToken?.userBalance?.gt(0);

  return (
    <Box>
      <PageHeader
        title={t('pageTitle', { daoName, ns: 'proposal' })}
        titleTestId={'title-proposals'}
        buttonVariant="text"
        buttonText={showDelegate ? t('delegate') : undefined}
        buttonClick={showDelegate ? delegate : undefined}
        buttonTestId="link-delegate"
      >
        <Link to="new">
          <Button marginLeft={4}>{t('createProposal', { ns: 'proposal' })}</Button>
        </Link>
      </PageHeader>
      <Proposals />
    </Box>
  );
}
