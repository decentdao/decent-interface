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
import { useSafeAPI } from '../../src/providers/App/hooks/useSafeAPI';
import { SafeMultisigDAO, AzoriusERC20DAO, AzoriusERC721DAO } from '../../src/types';

export default function DaoCreatePage() {
  const { push } = useRouter();
  const { requestWithRetries } = useAsyncRetry();
  const { toggleFavorite } = useAccountFavorites();
  const [redirectPending, setRedirectPending] = useState(false);
  const { t } = useTranslation('transaction');
  const safeAPI = useSafeAPI();

  const successCallback = useCallback(
    async (daoAddress: string) => {
      setRedirectPending(true);
      const { getAddress } = ethers.utils;
      const daoFound = await requestWithRetries(
        async () => (safeAPI ? safeAPI.getSafeCreationInfo(getAddress(daoAddress)) : undefined),
        8
      );
      toggleFavorite(daoAddress);
      if (daoFound) {
        push(DAO_ROUTES.dao.relative(daoAddress));
      } else {
        toast(t('failedIndexSafe'), {
          autoClose: false,
          closeOnClick: true,
          draggable: false,
          closeButton: false,
          progress: 1,
        });
        push(BASE_ROUTES.landing);
      }
    },
    [safeAPI, requestWithRetries, toggleFavorite, push, t]
  );

  const [deploy, pending] = useDeployDAO();

  const deployDAO = (daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO) => {
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
