import { Box, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Proposals from '../../components/Proposals';
import PageHeader from '../../components/ui/Header/PageHeader';
import { ModalType } from '../../components/ui/modals/ModalProvider';
import { useFractalModal } from '../../components/ui/modals/useFractalModal';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../providers/Fractal/types';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';

export function Governance() {
  const { t } = useTranslation(['common', 'proposal']);
  const {
    gnosis: { daoName },
    governance: { type, governanceToken },
    gnosis: {
      safe: { owners },
    },
  } = useFractal();
  const {
    state: { account },
  } = useWeb3Provider();

  const delegate = useFractalModal(ModalType.DELEGATE);
  const showDelegate =
    type === GovernanceTypes.GNOSIS_SAFE_USUL && governanceToken?.userBalance?.gt(0);

  const showCreateButton =
    type === GovernanceTypes.GNOSIS_SAFE_USUL ?? owners?.includes(account || '');

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
        {showCreateButton && (
          <Link to="new">
            <Button marginLeft={4}>{t('createProposal', { ns: 'proposal' })}</Button>
          </Link>
        )}
      </PageHeader>
      <Proposals />
    </Box>
  );
}
