'use client';

import { ReactNode } from 'react';
import ClientOnly from '../../../src/components/ui/utils/ClientOnly';
import { APP_NAME } from '../../../src/constants/common';
import useDAOController from '../../../src/hooks/DAO/useDAOController';
import { useFractal } from '../../../src/providers/App/AppProvider';

export default function DaoPageLayout({
  children,
  params: { daoAddress },
}: {
  children: ReactNode;
  params: { daoAddress?: string };
}) {
  const { node } = useFractal();
  // TODO: We could move PageHeader here as well - but that will require breadcrumbs logic refactoring
  useDAOController({ daoAddress });

  return (
    <ClientOnly>
      <title>{node?.daoName ? `${node.daoName} | ${APP_NAME}` : APP_NAME}</title>
      {children}
    </ClientOnly>
  );
}
