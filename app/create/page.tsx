'use client';

import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import DaoCreator from '../../src/components/DaoCreator';
import { DAOCreateMode } from '../../src/components/DaoCreator/formComponents/EstablishEssentials';
import ClientOnly from '../../src/components/ui/utils/ClientOnly';
import { BASE_ROUTES, DAO_ROUTES } from '../../src/constants/routes';
import { useAccountFavorites } from '../../src/hooks/DAO/loaders/useFavorites';
import useDeployDAO from '../../src/hooks/DAO/useDeployDAO';
import { useAsyncRetry } from '../../src/hooks/utils/useAsyncRetry';
import { useFractal } from '../../src/providers/App/AppProvider';
import { SafeMultisigDAO, AzoriusGovernanceDAO } from '../../src/types';

export default function DaoCreatePage() {
  const { push } = useRouter();
  const { requestWithRetries } = useAsyncRetry();
  const {
    clients: { safeService },
  } = useFractal();
  const { toggleFavorite } = useAccountFavorites();
  const [redirectPending, setRedirectPending] = useState(false);
  const { t } = useTranslation('transaction');

  const successCallback = useCallback(
    async (daoAddress: string) => {
      if (!safeService) return;
      setRedirectPending(true);
      const { getAddress } = ethers.utils;
      const daoFound = await requestWithRetries(
        () => safeService.getSafeCreationInfo(getAddress(daoAddress)),
        8
      );
      toggleFavorite(daoAddress);
      if (daoFound) {
        push(DAO_ROUTES.dao.relative(daoAddress));
      } else {
        toast(t('failedIndexGnosis'), {
          autoClose: false,
          closeOnClick: true,
          draggable: false,
          closeButton: false,
          progress: 1,
        });
        push(BASE_ROUTES.landing);
      }
    },
    [safeService, requestWithRetries, toggleFavorite, push, t]
  );

  const [deploy, pending] = useDeployDAO();

  const deployDAO = (daoData: SafeMultisigDAO | AzoriusGovernanceDAO) => {
    deploy(daoData, successCallback);
  };

  return (
    <ClientOnly>
      <DaoCreator
        pending={pending || redirectPending}
        deployDAO={deployDAO}
        mode={DAOCreateMode.ROOTDAO}
      />
    </ClientOnly>
  );
}
