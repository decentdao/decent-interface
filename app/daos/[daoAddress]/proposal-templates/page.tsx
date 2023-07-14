'use client';

import { Button, Show } from '@chakra-ui/react';
import { AddPlus } from '@decent-org/fractal-ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import ProposalTemplates from '../../../../src/components/ProposalTemplates';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../src/components/ui/utils/ClientOnly';
import { DAO_ROUTES } from '../../../../src/constants/routes';
import useSubmitProposal from '../../../../src/hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../../src/providers/App/AppProvider';

export default function ProposalTemplatesPage() {
  const { t } = useTranslation();
  const {
    node: { daoAddress },
  } = useFractal();
  const { canUserCreateProposal } = useSubmitProposal();

  return (
    <ClientOnly>
      <PageHeader
        title={t('proposalTemplates', { ns: 'breadcrumbs' })}
        breadcrumbs={[
          {
            terminus: t('proposalTemplates', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
      >
        {canUserCreateProposal && (
          <Link href={DAO_ROUTES.proposalTemplateNew.relative(daoAddress)}>
            <Button minW={0}>
              <AddPlus />
              <Show above="sm">{t('create')}</Show>
            </Button>
          </Link>
        )}
      </PageHeader>
      <ProposalTemplates />
    </ClientOnly>
  );
}
