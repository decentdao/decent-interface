'use client';

import { ReactNode } from 'react';
import useDAOController from '../../../src/hooks/DAO/useDAOController';
import useDAOName from '../../../src/hooks/DAO/useDAOName';

export default function DaoPageLayout({
  children,
  params: { daoAddress },
}: {
  children: ReactNode;
  params: { daoAddress: string };
}) {
  // TODO: We could move PageHeader here as well - but that will require breadcrumbs logic refactoring
  useDAOController({ daoAddress });
  const { daoRegistryName } = useDAOName({
    address: daoAddress,
  });

  return (
    <>
      <title>{daoRegistryName ? `${daoRegistryName} | Fractal` : 'Fractal'}</title>
      {children}
    </>
  );
}
