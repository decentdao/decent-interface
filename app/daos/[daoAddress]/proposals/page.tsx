'use client';

import { Box, Button, Show } from '@chakra-ui/react';
import { AddPlus } from '@decent-org/fractal-ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import Proposals from '../../../../src/components/Proposals';
import { ModalType } from '../../../../src/components/ui/modals/ModalProvider';
import { useFractalModal } from '../../../../src/components/ui/modals/useFractalModal';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../src/constants/routes';
import { useFractal } from '../../../../src/providers/App/AppProvider';
import { AzoriusGovernance, StrategyType } from '../../../../src/types';

export default function ProposalsPage() {
  const { t } = useTranslation(['common', 'proposal', 'breadcrumbs']);
  const {
    governance,
    node: { daoAddress, safe },
  } = useFractal();
  const { type } = governance;
  const { address: account } = useAccount();
  const azoriousGovernance = governance as AzoriusGovernance;
  const delegate = useFractalModal(ModalType.DELEGATE);
  const showDelegate =
    type === StrategyType.GNOSIS_SAFE_USUL &&
    !!azoriousGovernance.votesToken.balance &&
    azoriousGovernance.votesToken.balance.gt(0);

  const showCreateButton =
    type === StrategyType.GNOSIS_SAFE_USUL ? true : safe?.owners.includes(account || '');

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
          <Link href={DAO_ROUTES.proposalNew.relative(daoAddress)}>
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
