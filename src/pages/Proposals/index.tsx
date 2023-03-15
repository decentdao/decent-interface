import { Box, Button, Show } from '@chakra-ui/react';
import { AddPlus } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Proposals from '../../components/Proposals';
import { ModalType } from '../../components/ui/modals/ModalProvider';
import { useFractalModal } from '../../components/ui/modals/useFractalModal';
import PageHeader from '../../components/ui/page/Header/PageHeader';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../types';

export function Governance() {
  const { t } = useTranslation(['common', 'proposal', 'breadcrumbs']);
  const {
    governance: { type, governanceToken },
    gnosis: {
      safe: { owners },
    },
  } = useFractal();

  const { address: account } = useAccount();

  const delegate = useFractalModal(ModalType.DELEGATE);
  const showDelegate =
    type === GovernanceTypes.GNOSIS_SAFE_USUL && governanceToken?.userBalance?.gt(0);

  const showCreateButton =
    type === GovernanceTypes.GNOSIS_SAFE_USUL ? true : owners?.includes(account || '');

  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          {
            title: t('proposals', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
        buttonVariant="secondary"
        buttonText={showDelegate ? t('delegate') : undefined}
        buttonClick={showDelegate ? delegate : undefined}
        buttonTestId="link-delegate"
      >
        {showCreateButton && (
          <Link to="new">
            <Button minW={0}>
              <AddPlus />
              <Show above="sm">{t('create')}</Show>
            </Button>
          </Link>
        )}
      </PageHeader>
      <Proposals />
    </Box>
  );
}
