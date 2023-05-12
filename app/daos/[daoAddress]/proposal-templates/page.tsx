'use client';

import { Box, Button, Show } from '@chakra-ui/react';
import { AddPlus } from '@decent-org/fractal-ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import ProposalTemplates from '../../../../src/components/ProposalTemplates';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../src/components/ui/utils/ClientOnly';
import { DAO_ROUTES } from '../../../../src/constants/routes';
import { useFractal } from '../../../../src/providers/App/AppProvider';
import { GovernanceModuleType } from '../../../../src/types';

export default function ProposalTemplatesPage() {
  const { t } = useTranslation();
  const {
    governance: { type },
    node: { safe, daoAddress },
    readOnly: { user },
  } = useFractal();
  const { owners } = safe || {};
  const showCreateButton =
    type === GovernanceModuleType.AZORIUS ? true : owners?.includes(user.address || '');

  return (
    <ClientOnly>
      <Box>
        <PageHeader
          title={t('proposalTemplates', { ns: 'breadcrumbs' })}
          breadcrumbs={[
            {
              terminus: t('proposalTemplates', { ns: 'breadcrumbs' }),
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
    </ClientOnly>
  );
}
