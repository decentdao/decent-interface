'use client';

import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import DaoCreator from '../../src/components/DaoCreator';
import { DAO_ROUTES } from '../../src/constants/routes';
import { useAccountFavorites } from '../../src/hooks/DAO/loaders/useFavorites';
import useDeployDAO from '../../src/hooks/DAO/useDeployDAO';
import { useAsyncRetry } from '../../src/hooks/utils/useAsyncRetry';
import { useFractal } from '../../src/providers/App/AppProvider';
import { GnosisDAO, TokenGovernanceDAO } from '../../src/types';

export default function DaoCreatePage() {
  const { push } = useRouter();
  const { requestWithRetries } = useAsyncRetry();
  const {
    clients: { safeService },
  } = useFractal();
  const { toggleFavorite } = useAccountFavorites();
  const successCallback = useCallback(
    async (daoAddress: string) => {
      if (!safeService) return;
      const { getAddress } = ethers.utils;
      const daoFound = await requestWithRetries(
        () => safeService.getSafeCreationInfo(getAddress(daoAddress)),
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
