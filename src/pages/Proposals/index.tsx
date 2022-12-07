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
    governance,
  } = useFractal();
  const delegate = useFractalModal(ModalType.DELEGATE);
  const isUsul = governance.type === GovernanceTypes.GNOSIS_SAFE_USUL;
  return (
    <Box>
      <PageHeader
        title={t('pageTitle', { daoName, ns: 'proposal' })}
        titleTestId={'title-proposals'}
        buttonVariant="text"
        buttonText={isUsul ? t('delegate') : undefined}
        buttonClick={isUsul ? delegate : undefined}
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
