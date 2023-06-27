'use client';

import { Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DaoNode } from '../../../../src/components/pages/DaoHierarchy/DaoNode';
import { BarLoader } from '../../../../src/components/ui/loaders/BarLoader';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../src/components/ui/utils/ClientOnly';
import { HEADER_HEIGHT } from '../../../../src/constants/common';
import { useFractal } from '../../../../src/providers/App/AppProvider';

export default function HierarchyPage() {
  const {
    node: { daoAddress, daoName, nodeHierarchy },
  } = useFractal();
  const { t } = useTranslation('breadcrumbs');

  if (!daoAddress) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <ClientOnly>
      <PageHeader
        title={t('headerTitle', {
          daoName,
          subject: t('nodes'),
        })}
        breadcrumbs={[
          {
            terminus: t('nodes'),
            path: '',
          },
        ]}
      />
      <DaoNode
        daoAddress={nodeHierarchy.parentAddress || daoAddress}
        depth={0}
        siblingCount={0}
      />
    </ClientOnly>
  );
}
