'use client';

import { Center, Link } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DaoNode } from '../../../../src/components/pages/DaoHierarchy/DaoNode';
import { BarLoader } from '../../../../src/components/ui/loaders/BarLoader';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../src/components/ui/utils/ClientOnly';
import { HEADER_HEIGHT } from '../../../../src/constants/common';
import { DAO_ROUTES } from '../../../../src/constants/routes';
import useDAOName from '../../../../src/hooks/DAO/useDAOName';
import { useFractal } from '../../../../src/providers/App/AppProvider';

export default function HierarchyPage() {
  const {
    node: { daoAddress, daoName, nodeHierarchy },
  } = useFractal();
  const { t } = useTranslation('breadcrumbs');
  const { daoRegistryName } = useDAOName({ address: nodeHierarchy.parentAddress || undefined });

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
          daoName: daoName,
          subject: t('nodes'),
        })}
        breadcrumbs={[
          {
            terminus: t('nodes'),
            path: '',
          },
        ]}
      />
      {nodeHierarchy.parentAddress && (
        <Link
          color="gold.500"
          _hover={{ textDecoration: 'none', color: 'gold.500-hover' }}
          href={DAO_ROUTES.hierarchy.relative(nodeHierarchy.parentAddress)}
        >
          {t('parentLink', { parent: daoRegistryName })}
        </Link>
      )}
      <DaoNode
        daoAddress={daoAddress}
        depth={0}
        siblingCount={0}
      />
    </ClientOnly>
  );
}
