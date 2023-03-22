'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import DaoCreator from '../../src/components/DaoCreator';
import { DAO_ROUTES } from '../../src/constants/routes';
import useDeployDAO from '../../src/hooks/DAO/useDeployDAO';
import { useAsyncRetry } from '../../src/hooks/utils/useAsyncRetry';
import { useFractal } from '../../src/providers/Fractal/hooks/useFractal';
import { GnosisDAO, TokenGovernanceDAO } from '../../src/types';

export default function DaoCreatePage() {
  const { push } = useRouter();
  const { requestWithRetries } = useAsyncRetry();
  const {
    gnosis: { safeService },
    account: {
      favorites: { toggleFavorite },
    },
  } = useFractal();

  const successCallback = useCallback(
    async (daoAddress: string) => {
      if (!safeService) return;

      const daoFound = await requestWithRetries(
        () => safeService.getSafeCreationInfo(daoAddress),
        5
      );
      if (daoFound) {
        toggleFavorite(daoAddress);
        push(DAO_ROUTES.dao.relative(daoAddress));
      }
    },
    [safeService, requestWithRetries, toggleFavorite, push]
  );

  const [deploy, pending] = useDeployDAO();

  const deployDAO = (daoData: GnosisDAO | TokenGovernanceDAO) => {
    deploy(daoData, successCallback);
  };

  return (
    <DaoCreator
      pending={pending}
      deployDAO={deployDAO}
    />
  );
}
