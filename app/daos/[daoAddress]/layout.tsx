'use client';

import { ReactNode } from 'react';
import useDAOController from '../../../src/hooks/DAO/useDAOController';
import { useFractal } from '../../../src/providers/App/AppProvider';

export default function DaoPageLayout({
  children,
  params: { daoAddress },
}: {
  children: ReactNode;
  params: { daoAddress?: string };
}) {
  const {
    node: { daoName },
  } = useFractal();
  // TODO: We could move PageHeader here as well - but that will require breadcrumbs logic refactoring
  useDAOController({ daoAddress });

  return (
    <>
      <title>{daoName ? `${daoName} | Fractal` : 'Fractal'}</title>
      {children}
    </>
  );
}
