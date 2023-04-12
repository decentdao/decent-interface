'use client';

import { Box, Button, Show } from '@chakra-ui/react';
import { AddPlus } from '@decent-org/fractal-ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import ProposalTemplates from '../../../../src/components/ProposalTemplates';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../src/constants/routes';
import { useFractal } from '../../../../src/providers/App/AppProvider';
import { StrategyType } from '../../../../src/types';

export default function ProposalTemplatesPage() {
  const { t } = useTranslation();
  const {
    governance: { type },
    node: { safe, daoAddress },
  } = useFractal();
  const { owners } = safe || {};
  const { address: account } = useAccount();
  const showCreateButton =
    type === StrategyType.GNOSIS_SAFE_USUL ? true : owners?.includes(account || '');

  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          {
            title: t('proposalTemplates', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
      >
        {showCreateButton && (
          <Link href={DAO_ROUTES.proposalTemplateNew.relative(daoAddress)}>
            <Button minW={0}>
              <AddPlus />
              <Show above="sm">{t('create')}</Show>
            </Button>
          </Link>
        )}
      </PageHeader>
      <ProposalTemplates />
    </Box>
  );
}
